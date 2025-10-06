"use client";

import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { QuantizeLogo } from "@/components/quantize-logo";

function ModernHeader() {
    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        },
        {
            title: "Product",
            description: "Discover AI-powered search capabilities and features.",
            items: [
                {
                    title: "Search",
                    href: "/home",
                },
                {
                    title: "Features",
                    href: "/about",
                },
                {
                    title: "Pricing",
                    href: "/pricing",
                },
                {
                    title: "API",
                    href: "/api-docs",
                },
            ],
        },
        {
            title: "Company",
            description: "Learn more about Quantize and our mission.",
            items: [
                {
                    title: "About us",
                    href: "/about",
                },
                {
                    title: "Contact us",
                    href: "/contact",
                },
                {
                    title: "Privacy",
                    href: "/privacy",
                },
                {
                    title: "Terms",
                    href: "/terms",
                },
            ],
        },
    ];

    const [isOpen, setOpen] = useState(false);
    const [location, setLocation] = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { currentUser, signOut: firebaseSignOut } = useFirebaseAuth();

    const handleFirebaseLogout = async () => {
        await firebaseSignOut();
        logout();
        setLocation('/');
    };

    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background/80 backdrop-blur-md border-b border-white/10">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
                    <NavigationMenu className="flex justify-start items-start">
                        <NavigationMenuList className="flex justify-start gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.href ? (
                                        <>
                                            <NavigationMenuLink asChild>
                                                <Link href={item.href}>
                                                    <Button variant="ghost" className="text-white/70 hover:text-white">
                                                        {item.title}
                                                    </Button>
                                                </Link>
                                            </NavigationMenuLink>
                                        </>
                                    ) : (
                                        <>
                                            <NavigationMenuTrigger className="font-medium text-sm text-white/70 hover:text-white bg-transparent">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent className="!w-[450px] p-4 bg-black/90 backdrop-blur-md border border-white/10">
                                                <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-base text-white">{item.title}</p>
                                                            <p className="text-white/60 text-sm">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        <Button size="sm" className="mt-10 bg-blue-600 hover:bg-blue-700" onClick={() => setLocation('/waitlist')}>
                                                            Join the Waitlist
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-col text-sm h-full justify-end">
                                                        {item.items?.map((subItem) => (
                                                            <NavigationMenuLink
                                                                asChild
                                                                key={subItem.title}
                                                            >
                                                                <Link
                                                                    href={subItem.href}
                                                                    className="flex flex-row justify-between items-center hover:bg-white/10 py-2 px-4 rounded text-white/70 hover:text-white"
                                                                >
                                                                    <span>{subItem.title}</span>
                                                                    <MoveRight className="w-4 h-4 text-white/40" />
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            </NavigationMenuContent>
                                        </>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex lg:justify-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <QuantizeLogo size={24} />
                        <p className="font-semibold text-lg bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
                            Quantize
                        </p>
                    </Link>
                </div>
                <div className="flex justify-end w-full gap-4">
                    {currentUser || (isAuthenticated && user) ? (
                        <>
                            <Button variant="ghost" className="hidden md:inline text-white/70 hover:text-white">
                                Dashboard
                            </Button>
                            <div className="border-r hidden md:inline border-white/20"></div>
                            <Button 
                                variant="outline" 
                                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                                onClick={() => setLocation('/favorites')}
                            >
                                Favorites
                            </Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleFirebaseLogout}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" className="hidden md:inline text-white/70 hover:text-white">
                                Book a demo
                            </Button>
                            <div className="border-r hidden md:inline border-white/20"></div>
                            <Button 
                                variant="outline" 
                                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                                onClick={() => setLocation('/auth')}
                            >
                                Sign in
                            </Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setLocation('/waitlist')}
                            >
                                Get started
                            </Button>
                        </>
                    )}
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="text-white">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-black/90 backdrop-blur-md shadow-lg py-4 container gap-8 border-white/10">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                    <div className="flex flex-col gap-2">
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                className="flex justify-between items-center text-white"
                                                onClick={() => setOpen(false)}
                                            >
                                                <span className="text-lg">{item.title}</span>
                                                <MoveRight className="w-4 h-4 stroke-1 text-white/60" />
                                            </Link>
                                        ) : (
                                            <p className="text-lg text-white">{item.title}</p>
                                        )}
                                        {item.items &&
                                            item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.href}
                                                    className="flex justify-between items-center text-white/70"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    <span>
                                                        {subItem.title}
                                                    </span>
                                                    <MoveRight className="w-4 h-4 stroke-1" />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export { ModernHeader };