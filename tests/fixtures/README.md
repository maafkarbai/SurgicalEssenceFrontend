# Synthetic SMTP TLS fixtures

`synthetic-smtp-cert.pem` and `synthetic-smtp-key.pem` are a self-signed, offline-generated test pair for loopback SMTP tests only. The certificate names localhost/127.0.0.1 and is valid from 2026 to 2036. The test explicitly trusts this certificate for one connection and verifies that an ordinary connection rejects it. Nothing is installed in the machine trust store. This key is not a production credential and must never be used by a deployed server.
