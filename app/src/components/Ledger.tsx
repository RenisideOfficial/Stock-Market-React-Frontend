// Ledger.tsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
  Fade,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import StockCard from "./StockCard";

export default function Ledger() {
  const [ledger] = useState([]);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box className="Ledger" w="full">
      <VStack spacing={3} align="stretch">
        {ledger.map(
          (transaction: {
            count: number;
            id: string;
            symbol: string;
            price: number;
          }) => {
            const count_abs = Math.abs(transaction.count);
            const isBuy = transaction.count > 0;

            return (
              <Fade in key={transaction.id}>
                <Box
                  p={4}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  shadow="sm"
                  _hover={{ shadow: "md", transform: "translateX(4px)" }}
                  transition="all 0.2s">
                  <HStack spacing={4} align="center">
                    <Badge
                      colorScheme={isBuy ? "green" : "red"}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      gap={1}>
                      <Icon
                        as={isBuy ? TrendingUp : TrendingDown}
                        boxSize={3}
                      />
                      <Text>{isBuy ? "BOUGHT" : "SOLD"}</Text>
                    </Badge>
                    <Icon as={ArrowRight} color="gray.400" boxSize={4} />
                    <StockCard
                      symbol={transaction.symbol}
                      price={transaction.price}
                      count={count_abs}
                      variant="compact"
                    />
                  </HStack>
                </Box>
              </Fade>
            );
          },
        )}
        {ledger.length === 0 && (
          <Box
            p={8}
            bg={bgColor}
            borderWidth="2px"
            borderColor={borderColor}
            borderStyle="dashed"
            borderRadius="xl"
            textAlign="center">
            <Text color="gray.500">No transactions yet. Start trading!</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
