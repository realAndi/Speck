import '../app/globals.css'; 
import type { AppProps } from 'next/app';
import { ThemeProvider } from "@/components/theme-provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <Component {...pageProps} />
  </ThemeProvider>
  );
}

export default MyApp;