// PositionsList.tsx
import React, { useEffect, useState } from "react";
import accounts from "../services/accounts.service";
import { Position } from "../App";
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
  Progress,
  useColorModeValue,
  IconButton,
  Tooltip,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

const format = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format;

function PositionsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    accounts.getPortfolio().then(({ positions }) => {
      setPositions(positions);
      setIsLoading(false);
    });
  }, []);

  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.regularMarketPrice * pos.quantity,
    0,
  );

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="md">
      <CardHeader pb={2}>
        <Heading size="md">Portfolio Holdings</Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          {positions.length} position{positions.length !== 1 ? "s" : ""} · Total{" "}
          {format(totalValue)}
        </Text>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {positions.map((position) => {
            const gainLoss =
              (position.regularMarketPrice - position.purchasePrice) *
              position.quantity;
            const isPositive = gainLoss >= 0;
            const allocation =
              ((position.regularMarketPrice * position.quantity) / totalValue) *
              100;

            return (
              <Box
                key={position.purchaseDate.toString()}
                as={Link}
                to={"/stocks/" + position.symbol}
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
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <HStack>
                      <Heading size="sm">{position.symbol}</Heading>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {position.quantity} share
                        {position.quantity !== 1 ? "s" : ""}
                      </Text>
                    </HStack>
                    <Tooltip label="View details">
                      <IconButton
                        icon={<ChevronRight size={16} />}
                        variant="ghost"
                        size="sm"
                        aria-label="View details"
                        rounded="full"
                      />
                    </Tooltip>
                  </HStack>

                  <HStack justify="space-between" align="flex-end">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.500">
                        Current Price
                      </Text>
                      <Text fontWeight="bold">
                        {format(position.regularMarketPrice)}
                      </Text>
                    </VStack>

                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" color="gray.500">
                        Gain/Loss
                      </Text>
                      <HStack spacing={1}>
                        {isPositive ? (
                          <TrendingUp size={16} color="green" />
                        ) : (
                          <TrendingDown size={16} color="red" />
                        )}
                        <Text
                          color={isPositive ? "green.500" : "red.500"}
                          fontWeight="bold">
                          {format(Math.abs(gainLoss))}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Progress
                    value={allocation}
                    size="sm"
                    colorScheme="cyan"
                    borderRadius="full"
                    hasStripe
                  />

                  <HStack
                    justify="space-between"
                    fontSize="xs"
                    color="gray.500">
                    <Text>{allocation.toFixed(1)}% of portfolio</Text>
                    <Badge
                      colorScheme={
                        position.regularMarketChangePercent > 0
                          ? "green"
                          : "red"
                      }>
                      {position.regularMarketChangePercent > 0 ? "+" : ""}
                      {position.regularMarketChangePercent.toFixed(2)}%
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            );
          })}

          {positions.length === 0 && (
            <Box
              p={8}
              textAlign="center"
              borderWidth="2px"
              borderColor={borderColor}
              borderStyle="dashed"
              borderRadius="lg">
              <Text color="gray.500">No positions yet. Start trading!</Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default PositionsList;
