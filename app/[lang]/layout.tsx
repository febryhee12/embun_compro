import React from "react";

export async function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
