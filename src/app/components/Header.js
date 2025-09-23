import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const Header = () => {
  const { user, logout, loading } = useAuth();

  const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="fixed top-0 left-0 w-[220px] bg-darkbg h-screen border-r border-r-rblacklight">
      <div className="border-b border-b-rblacklight w-full">
        <Image src={"/logo-txt.png"} alt="logo" width={200} height={200} />
      </div>

      {!loading && user && (
        <div className="flex flex-col items-start space-y-2 mt-6 text-sm">
          <p className="ml-2 text-linencream">
            Hola, {capitalizeName(user.name)}
          </p>
          <button
            onClick={logout}
            className="text-linencream text-start hover:bg-rblack py-1 w-full px-2 cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
