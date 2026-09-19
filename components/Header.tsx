import React, { Suspense } from "react";
import ClientHeader from "./ClientHeader";

const Header = () => {
  return (
    <Suspense
      fallback={
        <div className="h-14 sm:h-[4.5rem] lg:h-[8.6rem] bg-cream" />
      }
    >
      <ClientHeader />
    </Suspense>
  );
};

export default Header;
