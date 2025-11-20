"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function MainContent({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();
	const pathname = usePathname();

	// Pages that should NOT have sidebar margin (login, register, home when not logged in)
	const noSidebarPages = ["/", "/login", "/register"];
	const shouldHaveSidebar = session && !noSidebarPages.includes(pathname);

	return <div className={shouldHaveSidebar ? "md:ml-64" : ""}>{children}</div>;
}
