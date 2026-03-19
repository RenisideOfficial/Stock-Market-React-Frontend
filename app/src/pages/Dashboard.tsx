// Dashboard.tsx
import {
  Box,
  Flex,
  Spacer,
  Heading,
  Text,
  SimpleGrid,
  Container,
  useColorModeValue,
  VStack,
  Icon,
  Button,
  Fade,
  HStack,
} from "@chakra-ui/react";
import PortfolioPreview from "../components/PortfolioPreview";
import React from "react";
import PositionsList from "../components/PositionsList";
import Newsfeed from "../components/Newsfeed";
import Watchlist from "../components/Watchlist";
import tokens from "../services/tokens.service";
import { Link as RouterLink } from "react-router-dom";
import { TrendingUp, LogIn, UserPlus, Newspaper, Layout } from "lucide-react";

export default function Dashboard() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  return (
    <Box
      className="Dashboard"
      bg={bgColor}
      minH="100vh"
      w="full"
      overflowX="hidden">
      <VStack spacing={{ base: 4, md: 8 }} align="stretch" w="full">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" spacing={0}>
            <Heading
              size={{ base: "md", md: "lg" }}
              display="flex"
              alignItems="center"
              gap={2}>
              <Icon as={Layout} color={accentColor} />
              Dashboard
            </Heading>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
              Welcome back to StockMart
            </Text>
          </VStack>
        </Flex>

        {/* Non-authenticated user banner */}
        {!tokens.isAuthenticated() && (
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={{ base: 4, md: 8 }}
            textAlign="center"
            shadow="lg">
            <VStack spacing={4}>
              <Icon
                as={TrendingUp}
                boxSize={{ base: 8, md: 12 }}
                color={accentColor}
              />
              <Heading size={{ base: "md", md: "lg" }}>
                Start Trading Today
              </Heading>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="gray.500"
                maxW="md">
                Join thousands of traders in the most realistic stock market
                simulation
              </Text>
              <HStack spacing={4} pt={2} wrap="wrap" justify="center">
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="cyan"
                  size={{ base: "sm", md: "lg" }}
                  leftIcon={<UserPlus size={16} />}
                  borderRadius="full">
                  Create Account
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="outline"
                  size={{ base: "sm", md: "lg" }}
                  leftIcon={<LogIn size={16} />}
                  borderRadius="full">
                  Sign In
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Main Content - use templateColumns that don't overflow */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: 4, md: 6 }}
          w="full">
          {/* Left Column */}
          <Box minW={0}>
            {" "}
            {/* minW=0 prevents grid item from overflowing */}
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              {tokens.isAuthenticated() && <PortfolioPreview />}

              <Box>
                <Flex align="center" mb={3} gap={2}>
                  <Icon as={Newspaper} color={accentColor} />
                  <Heading size={{ base: "sm", md: "md" }}>Market News</Heading>
                </Flex>
                <Newsfeed symbol="" />
              </Box>
            </VStack>
          </Box>

          {/* Right Column */}
          {tokens.isAuthenticated() && (
            <Box minW={0}>
              {" "}
              {/* minW=0 prevents grid item from overflowing */}
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <PositionsList />
                <Watchlist />
              </VStack>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
