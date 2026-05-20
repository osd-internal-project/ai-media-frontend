"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const organizationId = session?.user?.organizationId;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (status === "authenticated") {
      if (organizationId) {
        router.replace(`/page/project`);
      } else {
        setShow(true);
      }
    }
    
  }, [status, router]);

  return (
    show && (
      <div className="main-blank-page">
        <div className="main-blank-content">
          <div className="main-blank-icon">🏢</div>
          <p className="main-blank-text">Not selected Organization yet</p>
          <p className="main-blank-subtext">
            Please select an organization from the header to get started.
          </p>
        </div>
      </div>
    )
  );
};

export default Page;
