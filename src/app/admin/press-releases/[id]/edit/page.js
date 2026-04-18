"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PressReleaseForm from "../../PressReleaseForm";

export default function EditPressReleasePage() {
  const { id } = useParams();
  const router  = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/press-releases/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((json) => json && setData(json.data));
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  return <PressReleaseForm initial={data} isEdit />;
}
