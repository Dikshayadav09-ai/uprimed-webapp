import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./redux/store/StoreProvider";
import { Toaster } from "sonner";
import SideBar from "@/components/SideBar";
import VerifyAuth from "@/lib/verifyAuth";
import Script from "next/script";



export const metadata: Metadata = {
  title: "UPTIMED",
  description: "Uptimed is a website uptime monitoring service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <StoreProvider>
      <html lang="en" className="bg-black">
        <head><script src="https://accounts.google.com/gsi/client" defer>
        </script>
        </head>
         <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <body
          className={`antialiased`}
        >
          <Toaster theme="light" invert />
          <VerifyAuth>
            {children}
          </VerifyAuth>
        </body>
      </html>
    </StoreProvider>

  );
}
