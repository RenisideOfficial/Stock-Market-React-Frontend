// Newsfeed.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Text,
  Heading,
  Stack,
  Link,
  Spinner,
  Badge,
  HStack,
  VStack,
  useColorModeValue,
  Image,
  AspectRatio,
  Skeleton,
} from "@chakra-ui/react";
import axios from "axios";
import { Clock, Newspaper, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  publishedAt: string;
  symbols: string[];
  source: string;
  sourceUrl: string;
  imageUrl?: string;
}

function timeSince(date: string) {
  const now = Date.now();
  const seconds = Math.floor((now - new Date(date).getTime()) / 1000);
  const intervals = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const value = Math.floor(seconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.name}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

function Newsfeed(props: { symbol: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/news/" + (props.symbol || "")).then((res) => {
      setNews(res.data.slice(0, 9));
      setIsLoading(false);
    });
  }, [props.symbol]);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}>
            <CardBody>
              <Skeleton height="200px" />
              <Stack mt={4} spacing={3}>
                <Skeleton height="20px" />
                <Skeleton height="60px" />
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {news.map((item, index) => (
        <Card
          key={index}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{
            transform: "translateY(-4px)",
            shadow: "xl",
            borderColor: accentColor,
          }}>
          <Link
            href={item.sourceUrl}
            isExternal
            _hover={{ textDecoration: "none" }}>
            <AspectRatio ratio={16 / 9}>
              <Box bg="gray.100" position="relative">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    objectFit="cover"
                  />
                ) : (
                  <VStack justify="center" h="full" bg="gray.100">
                    <Newspaper size={40} color="gray.400" />
                  </VStack>
                )}
                <Badge
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="cyan"
                  variant="solid"
                  borderRadius="full"
                  px={2}>
                  {item.source}
                </Badge>
              </Box>
            </AspectRatio>

            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack color={textColor} fontSize="sm">
                  <Clock size={14} />
                  <Text>{timeSince(item.publishedAt)}</Text>
                </HStack>

                <Heading size="sm" noOfLines={2} lineHeight="tall">
                  {item.title}
                </Heading>

                <Text fontSize="sm" color={textColor} noOfLines={3}>
                  {item.description}
                </Text>
              </VStack>
            </CardBody>

            {item.symbols.length > 0 && (
              <CardFooter pt={0}>
                <HStack flexWrap="wrap" spacing={2}>
                  {item.symbols.map((symbol) => (
                    <Badge
                      key={symbol}
                      as={Link}
                      href={"/stocks/" + symbol}
                      colorScheme="cyan"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                      _hover={{ bg: accentColor, color: "white" }}>
                      {symbol}
                    </Badge>
                  ))}
                </HStack>
              </CardFooter>
            )}
          </Link>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default Newsfeed;
