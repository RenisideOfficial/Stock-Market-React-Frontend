// Watchlist.tsx
import React, { useEffect, useState } from "react";
import accounts from "../services/accounts.service";
import {
  Box,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  SimpleGrid,
  Fade,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  Star,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Eye,
} from "lucide-react";

const format = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format;

interface WatchlistItem {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketChangePercent: number;
}

function Watchlist() {
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    accounts.getWatchlist(false).then((watchlist) => {
      setWatchlist(watchlist as WatchlistItem[]);
      setIsLoading(false);
    });
  }, []);

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="md"
      overflow="hidden">
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <HStack>
            <Star size={20} color="gold" fill="gold" />
            <Heading size="md">Watchlist</Heading>
          </HStack>
          <Badge colorScheme="cyan" borderRadius="full" px={3}>
            {watchlist.length} items
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {watchlist.map((stock, i) => {
            const isPositive = stock.regularMarketChangePercent > 0;
            return (
              <Fade in key={i}>
                <Box
                  as={Link}
                  to={"/stocks/" + stock.symbol}
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{
                    bg: hoverBg,
                    transform: "translateX(4px)",
                    shadow: "md",
                  }}
                  transition="all 0.2s">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3} flex={1}>
                      <Box
                        bg={accentColor}
                        w={10}
                        h={10}
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center">
                        <Eye size={16} color="white" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="sm">{stock.symbol}</Heading>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          noOfLines={1}
                          maxW="120px">
                          {stock.longName}
                        </Text>
                      </VStack>
                    </HStack>

                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {format(stock.regularMarketPrice)}
                      </Text>
                      <Badge
                        colorScheme={isPositive ? "green" : "red"}
                        borderRadius="full"
                        px={2}>
                        <HStack spacing={0.5}>
                          {isPositive ? (
                            <TrendingUp size={10} />
                          ) : (
                            <TrendingDown size={10} />
                          )}
                          <Text>
                            {isPositive ? "+" : ""}
                            {stock.regularMarketChangePercent.toFixed(2)}%
                          </Text>
                        </HStack>
                      </Badge>
                    </VStack>
                  </HStack>
                </Box>
              </Fade>
            );
          })}

          {watchlist.length === 0 && (
            <Box
              p={8}
              textAlign="center"
              borderWidth="2px"
              borderColor={borderColor}
              borderStyle="dashed"
              borderRadius="lg">
              <Star
                size={40}
                color={textColor}
                style={{ margin: "0 auto 12px" }}
              />
              <Text color={textColor} mb={2}>
                Your watchlist is empty
              </Text>
              <Text fontSize="sm" color={textColor}>
                Search stocks and click "Add to Watchlist"
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default Watchlist;
