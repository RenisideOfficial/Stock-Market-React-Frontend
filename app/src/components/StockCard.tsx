// StockCard.tsx - FIXED
import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { TrendingUp } from "lucide-react";

interface StockCardProps {
  symbol: string;
  price: number;
  count?: number;
  showButtons?: boolean;
  onBuy?: () => void;
  onSell?: () => void;
  variant?: "default" | "compact";
}

export default function StockCard({
  symbol,
  price,
  count = 0,
  showButtons = false,
  onBuy,
  onSell,
  variant = "default",
}: StockCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  if (variant === "compact") {
    return (
      <HStack
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={3}
        spacing={4}
        w="full">
        <Box
          bg={accentColor}
          w={10}
          h={10}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center">
          <TrendingUp size={20} color="white" />
        </Box>
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="bold">{symbol}</Text>
          <Text fontSize="sm" color="gray.500">
            {count} share{count !== 1 ? "s" : ""}
          </Text>
        </VStack>
        <VStack align="end" spacing={0}>
          <Text fontWeight="bold">${price.toFixed(2)}</Text>
          <Text fontSize="xs" color="gray.500">
            ${(price * count).toFixed(2)} total
          </Text>
        </VStack>
      </HStack>
    );
  }

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      shadow="md"
      _hover={{
        transform: "translateY(-2px)",
        shadow: "lg",
        borderColor: accentColor,
      }}
      transition="all 0.2s">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <Box
              bg={accentColor}
              w={12}
              h={12}
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center">
              <TrendingUp size={24} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">
                {symbol}
              </Text>
              {count > 0 && <Badge colorScheme="cyan">{count} shares</Badge>}
            </VStack>
          </HStack>
          <VStack align="end" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">
              ${price.toFixed(2)}
            </Text>
            {count > 0 && (
              <Text fontSize="sm" color="gray.500">
                ${(price * count).toFixed(2)} total
              </Text>
            )}
          </VStack>
        </HStack>

        {showButtons && onBuy && onSell && (
          <HStack spacing={3}>
            <Button
              leftIcon={<span>+</span>}
              colorScheme="green"
              variant="solid"
              flex={1}
              onClick={onBuy}
              size="lg"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}>
              Buy
            </Button>
            <Button
              leftIcon={<span>-</span>}
              colorScheme="red"
              variant="outline"
              flex={1}
              onClick={onSell}
              size="lg"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}>
              Sell
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
