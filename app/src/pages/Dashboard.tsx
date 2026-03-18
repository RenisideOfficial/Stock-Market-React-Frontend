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
    <Box className="Dashboard" bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" display="flex" alignItems="center" gap={2}>
                <Icon as={Layout} color={accentColor} />
                Dashboard
              </Heading>
              <Text color="gray.500">Welcome back to StockMart</Text>
            </VStack>
          </Flex>

          {!tokens.isAuthenticated() && (
            <Fade in>
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="2xl"
                p={8}
                textAlign="center"
                shadow="lg">
                <VStack spacing={4}>
                  <Icon as={TrendingUp} boxSize={12} color={accentColor} />
                  <Heading size="lg">Start Trading Today</Heading>
                  <Text color="gray.500" maxW="md">
                    Join thousands of traders in the most realistic stock market
                    simulation
                  </Text>
                  <VStack spacing={4} pt={4}>
                    <Button
                      as={RouterLink}
                      to="/signup"
                      colorScheme="cyan"
                      size="lg"
                      leftIcon={<UserPlus size={20} />}
                      borderRadius="full"
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
                      Create Account
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/login"
                      variant="outline"
                      size="lg"
                      leftIcon={<LogIn size={20} />}
                      borderRadius="full"
                      _hover={{ transform: "translateY(-2px)", shadow: "md" }}>
                      Sign In
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </Fade>
          )}

          {/* Main Content */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            {/* Left Column - Portfolio and News */}
            <Box gridColumn={{ base: "1", lg: "span 2" }}>
              <VStack spacing={6} align="stretch">
                {tokens.isAuthenticated() && <PortfolioPreview />}

                {/* News Section */}
                <Box>
                  <Flex align="center" mb={4} gap={2}>
                    <Icon as={Newspaper} color={accentColor} />
                    <Heading size="md">Market News</Heading>
                  </Flex>
                  <Newsfeed symbol="" />
                </Box>
              </VStack>
            </Box>

            {/* Right Column - Positions and Watchlist */}
            {tokens.isAuthenticated() && (
              <Box gridColumn={{ base: "1", lg: "3" }}>
                <VStack spacing={6} align="stretch">
                  <PositionsList />
                  <Watchlist />
                </VStack>
              </Box>
            )}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
