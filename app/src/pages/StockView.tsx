// StockView.tsx - FIXED with proper types
import React, { useEffect, useReducer, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Flex,
  VStack,
  HStack,
  Button,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  SlideFade,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import StockChart from "../components/StockChart";
import TransactionPane from "../components/TransactionPane";
import accounts from "../services/accounts.service";
import tokens from "../services/tokens.service";
import Newsfeed from "../components/Newsfeed";
import {
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  Home,
  ChevronRight,
  Info,
} from "lucide-react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface StockData {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

function StockView() {
  const { symbol } = useParams<{ symbol: string }>();
  const location = useLocation();
  const [onWatchlist, setOnWatchlist] = useState(false);
  const [stock, setStock] = useReducer(
    (state: StockData, newState: Partial<StockData>) => ({
      ...state,
      ...newState,
    }),
    {
      symbol: symbol || "",
      longName: "",
      regularMarketPrice: -1,
      regularMarketChangePercent: 0,
      regularMarketChange: 0,
      regularMarketOpen: 0,
      regularMarketDayHigh: 0,
      regularMarketDayLow: 0,
      regularMarketVolume: 0,
      marketCap: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
    },
  );

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    if (!symbol) return;

    if (tokens.isAuthenticated()) {
      accounts.getWatchlist(true).then((res: any[]) => {
        setOnWatchlist(res.some((item) => item.symbol === symbol));
      });
    }

    axios
      .get(`/api/stocks/${symbol}/info`)
      .then((res) => {
        setStock({ ...res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [location, symbol]);

  if (!symbol) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Text color="red.500">Invalid stock symbol</Text>
      </Flex>
    );
  }

  if (stock.regularMarketPrice < 0) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.500" thickness="4px" />
          <Text color="gray.500">Loading stock data...</Text>
        </VStack>
      </Flex>
    );
  }

  const isPositive = stock.regularMarketChangePercent > 0;

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb */}
        <Breadcrumb separator={<ChevronRight size={14} />} color="gray.500">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">
              <HStack spacing={1}>
                <Home size={14} />
                <Text as="span">Home</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/stocks">
              <Text as="span">Stocks</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text as="span" color={accentColor} fontWeight="bold">
              {symbol}
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <SlideFade in>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={4}>
            <HStack spacing={4}>
              <Box
                bg={accentColor}
                w={16}
                h={16}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center">
                <TrendingUp size={32} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="2xl">{symbol}</Heading>
                <Text fontSize="lg" color="gray.500">
                  {stock.longName}
                </Text>
              </VStack>
            </HStack>

            {tokens.isAuthenticated() && (
              <Button
                leftIcon={
                  onWatchlist ? <StarOff size={18} /> : <Star size={18} />
                }
                variant={onWatchlist ? "solid" : "outline"}
                colorScheme={onWatchlist ? "yellow" : "gray"}
                onClick={() => {
                  accounts
                    .editWatchlist(symbol, onWatchlist ? "remove" : "add")
                    .then(() => setOnWatchlist(!onWatchlist));
                }}
                size="lg"
                borderRadius="full"
                px={6}
                _hover={{ transform: "translateY(-2px)", shadow: "md" }}>
                {onWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              </Button>
            )}
          </Flex>
        </SlideFade>

        {/* Price Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            shadow="md">
            <StatLabel color={textColor}>Current Price</StatLabel>
            <StatNumber
              fontSize="3xl"
              color={isPositive ? "green.500" : "red.500"}>
              {formatter.format(stock.regularMarketPrice)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={isPositive ? "increase" : "decrease"} />
              {Math.abs(stock.regularMarketChange).toFixed(2)} (
              {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%)
            </StatHelpText>
          </Stat>

          <Stat
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            shadow="md">
            <StatLabel color={textColor}>Day Range</StatLabel>
            <StatNumber fontSize="lg">
              {formatter.format(stock.regularMarketDayLow)} -{" "}
              {formatter.format(stock.regularMarketDayHigh)}
            </StatNumber>
            <StatHelpText>
              <HStack spacing={1}>
                <Icon as={Info} boxSize={3} />
                <Text as="span">Today's trading range</Text>
              </HStack>
            </StatHelpText>
          </Stat>

          <Stat
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            shadow="md">
            <StatLabel color={textColor}>52 Week Range</StatLabel>
            <StatNumber fontSize="lg">
              {formatter.format(stock.fiftyTwoWeekLow)} -{" "}
              {formatter.format(stock.fiftyTwoWeekHigh)}
            </StatNumber>
            <StatHelpText>Year high/low</StatHelpText>
          </Stat>

          <Stat
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            shadow="md">
            <StatLabel color={textColor}>Volume</StatLabel>
            <StatNumber fontSize="lg">
              {stock.regularMarketVolume?.toLocaleString()}
            </StatNumber>
            <StatHelpText>Today's trading volume</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Chart */}
          <Box gridColumn={{ base: "1", lg: "span 2" }}>
            <StockChart symbol={symbol} />
          </Box>

          {/* Transaction Pane */}
          {tokens.isAuthenticated() && (
            <Box gridColumn={{ base: "1", lg: "3" }}>
              <TransactionPane
                symbol={symbol}
                price={stock.regularMarketPrice}
              />
            </Box>
          )}
        </SimpleGrid>

        {/* News Section */}
        <Box mt={8}>
          <HStack spacing={2} mb={4}>
            <Icon as={TrendingUp} color={accentColor} />
            <Heading size="lg">Related News</Heading>
          </HStack>
          <Newsfeed symbol={symbol} />
        </Box>
      </VStack>
    </Container>
  );
}

export default StockView;
