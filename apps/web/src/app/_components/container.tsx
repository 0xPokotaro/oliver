'use client';

import { useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";

const Container = () => {
  const { data, isLoading, error } = useUserProfile()

  useEffect(() => {
    console.log('data: ', data)
  }, [data])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Container</h1>
    </div>
  );
};

export default Container;
