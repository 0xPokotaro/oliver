"use client";

import { useEffect, useState } from "react";
import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export const PrivySection = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { sendCode, loginWithCode } = useLoginWithEmail();

  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    console.log("ready: ", ready);
    console.log("authenticated: ", authenticated);
    console.log("user: ", user);
  }, [ready, authenticated, user]);

  return (
    <div>
      <div>
        <input
          onChange={(e) => setEmail(e.currentTarget.value)}
          value={email}
        />
        <Button onClick={() => sendCode({ email })}>Send Code</Button>
      </div>
      <div>
        <input onChange={(e) => setCode(e.currentTarget.value)} value={code} />
        <Button onClick={() => loginWithCode({ code })}>Login</Button>
      </div>
    </div>
  );
};
