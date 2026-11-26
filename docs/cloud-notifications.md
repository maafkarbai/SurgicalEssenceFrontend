# Cloud RFQ notification outbox

The cloud worker extends the existing PostgreSQL RFQ store and Nodemailer SMTP setup. It does not change the public enquiry workflow or claim inbox delivery. A successful RFQ response still confirms durable acceptance only.

## Enable after staging approval

No production deployment, real SMTP test, environment change or live schedule was performed in this implementation. Keep the worker disabled until a named enquiry owner approves the sender, destination mailbox, backlog and schedule. Existing legacy pending enquiries are eligible: review their age and privacy/retention requirements before enabling. Do not point staging at the production database or production mailbox.

| Setting | Requirement |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Existing PostgreSQL connection; new namespaced outbox table creation permission. |
| `CRON_SECRET` | Independent random bearer secret of at least 32 characters, valid for an HTTP header. Keep it private; never put it in a URL or browser code. |
| `RFQ_NOTIFICATIONS_ENABLED` | Exactly `true` enables the worker. Missing/false keeps it disabled. |
| `SMTP_HOST`, `SMTP_PORT` | Verified SMTP host; default port 587. |
| `SMTP_SECURE` | `true` for implicit TLS (typically port 465); otherwise STARTTLS is required. Certificate verification is retained. |
| `SMTP_USER`, `SMTP_PASS` | Provider credentials if required; never committed or logged. |
| `RFQ_FROM`, `RFQ_TO` | One plain email address each; no display names or recipient lists. Use a verified sender and an approved internal enquiry mailbox. |

Call `GET` or `POST /internal/rfq-notifications` with `Authorization: Bearer <CRON_SECRET>` from the scheduler. GET supports the existing Vercel Cron mechanism. HEAD, PUT and other methods do not trigger sends. Responses are private/no-store and expose only processed/sent/retry counters. The route runs before catalogue/CMS readiness and never accepts a recipient or message from request parameters/body.

The [example cron fragment](cloud-notifications-cron.example.json) is deliberately **not active** in `vercel.json`. Merge it only into an approved deployment after confirming the project's scheduling plan/frequency and throughput needs. It proposes one invocation every five minutes, hence at most 12 messages/hour, before errors/retries. A more frequent allowed schedule increases throughput. Do not promise immediate notifications from a once-daily or disabled schedule. No additional scheduler service is required.

Vercel's current documentation describes `CRON_SECRET` bearer authentication and deployment-managed cron configuration: [managing Cron Jobs](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs). Cron Jobs are now documented as a legacy feature with a future migration to Schedules; the supplied fragment uses the existing supported mechanism and does not introduce a new SDK. Recheck plan support when activating. SMTP/TLS and timeout behaviour follows [Nodemailer's SMTP transport documentation](https://nodemailer.com/smtp).

## Durability and failure behaviour

- New RFQ acceptance and its `se_rfq_outbox` entry commit together. Existing idempotency/deduplication remains intact. The SQLite long-running worker remains separate; the cloud route requires PostgreSQL outbox methods and does not operate on local RFQs.
- The additive `se_rfq_outbox` table references `se_rfqs` with cascading deletion. It stores attempt count, next-attempt time, lease token/expiry, safe last-error code and SMTP-acceptance time. It contains no duplicate buyer payload.
- Each invocation discovers up to 100 pre-upgrade pending rows, then conditionally claims **one** due row with a fresh token and two-minute lease. Sent enquiries are excluded both at selection and at the authoritative conditional update. Competing workers may harmlessly find no claim; subsequent scheduled runs continue draining the queue.
- A normal SMTP attempt has a 12-second worker deadline and shorter connect/greeting/socket timeouts. On deadline the cloud transport destroys its retained TCP socket, including a stalled connection, before recording a retry. Nodemailer performs the normal STARTTLS/implicit TLS upgrade and certificate validation on that connection.
- Success means the configured SMTP server accepted the message, not that the destination inbox delivered it. Only the lease owner can mark the RFQ sent, in the same transaction as completing its outbox state.
- Failure retains the enquiry as pending and reschedules it after 1, 2, 4, 8, ... minutes, capped at six hours. Authentication/address failures are not silently discarded. A named operator must investigate recurring failures. There is no automatic permanent deletion/dead-letter purge.
- A worker crash leaves its lease to expire. A crash or uncertain SMTP response after provider acceptance but before database acknowledgement can produce a duplicate on retry. Stable Message-ID and SE reference assist identification; they do not guarantee provider deduplication. Delivery is at least once.
- Database operations and cold initialization also consume the existing 30-second Vercel function budget. SMTP's deadline does not guarantee the total request under database/network stalls. A platform interruption is recovered through lease expiry; real provider concurrency/latency must be tested in staging.

## Operations and acceptance checklist

Review status privately through the database provider console; do not expose these queries as a public endpoint:

```sql
SELECT r.id, r.created_at, r.notification_status, o.attempts,
       o.next_attempt_at, o.lease_until, o.last_error_code, o.sent_at
FROM se_rfqs r LEFT JOIN se_rfq_outbox o ON o.rfq_id = r.id
ORDER BY r.created_at DESC;
```

Times are epoch milliseconds. `sent_at` records SMTP acceptance. Review pending count, oldest pending age and repeated errors; overdue pending work requires the assigned enquiry owner to inspect the mailbox/configuration. Logs contain references and coarse event/error codes only: `rfq_notification_retry` and `cloud_outbox_unavailable`. SMTP responses, credentials and buyer payloads are not logged or returned.

In an isolated staging environment, approve and configure the mailbox, verify TLS/provider acceptance and SPF/DKIM/DMARC, submit one synthetic RFQ, trigger the worker, check the received reference and database status, repeat the trigger to confirm no resend, simulate failure/recovery, and test overlapping invocations against actual PostgreSQL. Confirm scheduler cadence and backlog clearance before production approval. Pause future sends by setting `RFQ_NOTIFICATIONS_ENABLED` to false through the approved environment/deployment process; retain database records for private review. Keep the public acceptance wording unchanged.

## Local verification

`node --test tests/cloud-outbox.test.js tests/cloud-notifications.test.js` uses pg-mem, synthetic temporary data, a local SMTP sink and controlled failure transports. It tests the real RFQ form-to-PostgreSQL-to-SMTP path, authentication, disabled configuration, lease fencing, crash recovery, retries, a stale-selection race, legacy pending rows, rejected recipients, deadline/socket cancellation and redacted errors. No email is sent outside loopback. pg-mem is not proof of PostgreSQL MVCC/locking behaviour. The installed Docker CLI has no running daemon here, so no real PostgreSQL container was tested.
