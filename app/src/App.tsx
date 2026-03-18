// App.tsx
import React, { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/Navbar";
import {
  Container,
  Box,
  Spinner,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const StockView = lazy(() => import("./pages/StockView"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
import NotFound from "./pages/NotFound";

export type Transaction = {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  date: Date;
  type: "buy" | "sell";
};

export type Position = {
  symbol: string;
  longName: string;
  purchasePrice: number;
  purchaseDate: Date;
  quantity: number;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketChangePercent: number;
};

// Loading component
const PageLoader = () => (
  <VStack justify="center" align="center" minH="400px" spacing={4}>
    <Spinner size="xl" color="cyan.500" thickness="4px" />
    <Text color="gray.500">Loading...</Text>
  </VStack>
);

// Page transition wrapper
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Container
        maxW="container.xl"
        py={{ base: 1, md: 6 }}
        px={{ base: 1, md: 4 }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <Dashboard />
                  </PageWrapper>
                }
              />
              <Route
                path="/login"
                element={
                  <PageWrapper>
                    <Login />
                  </PageWrapper>
                }
              />
              <Route
                path="/signup"
                element={
                  <PageWrapper>
                    <Signup />
                  </PageWrapper>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PageWrapper>
                    <Leaderboard />
                  </PageWrapper>
                }
              />
              <Route
                path="/stocks/:symbol"
                element={
                  <PageWrapper>
                    <StockView />
                  </PageWrapper>
                }
              />
              <Route
                path="*"
                element={
                  <PageWrapper>
                    <NotFound />
                  </PageWrapper>
                }
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default App;
