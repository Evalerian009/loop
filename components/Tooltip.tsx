// components/Tooltip.tsx
"use client";
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";

export default function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <Transition
        as={Fragment}
        show={show}
        enter="transition duration-100 ease-out"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-75 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute bottom-full mb-1 px-2 py-1 text-xs text-white bg-black rounded shadow-lg whitespace-nowrap z-50">
          {content}
        </div>
      </Transition>
    </div>
  );
}