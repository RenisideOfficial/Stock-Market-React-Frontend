// TransactionPane.tsx
import React, { useEffect, useState } from "react";
import accounts from "../services/accounts.service";
import {
  Box,
  Text,
  useToast,
  Tabs,
  TabList,
  Tab,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  TabPanels,
  TabPanel,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Progress,
  useColorModeValue,
  Icon,
  Tooltip,
  SlideFade,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { TrendingUp, DollarSign, Info, ArrowRight } from "lucide-react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function TransactionPane(props: { symbol: string; price: number }) {
  const [shares, setShares] = useState(1);
  const [buyingPower, setBuyingPower] = useState(0);
  const [availableShares, setAvailableShares] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const location = useLocation();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const submitTransaction = (
    symbol: string,
    quantity: number,
    isBuy: boolean,
  ) => {
    setIsLoading(true);
    accounts
      .makeTransaction(symbol, quantity, isBuy ? "buy" : "sell")
      .then(() => {
        toast({
          title: "Transaction Successful",
          description: `${isBuy ? "Bought" : "Sold"} ${quantity} shares of ${symbol}`,
          status: "success",
          position: "top-right",
          duration: 3000,
        });
        accounts.getBuyingPower().then(setBuyingPower);
        accounts.getAvailableShares(symbol).then(setAvailableShares);
        setIsLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Transaction Failed",
          description: err.message,
          status: "error",
          position: "top-right",
          duration: 3000,
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    accounts.getBuyingPower().then(setBuyingPower);
    accounts.getAvailableShares(props.symbol).then(setAvailableShares);
  }, [location]);

  const totalCost = props.price * shares;
  const canBuy = totalCost <= buyingPower;
  const canSell = shares <= availableShares;
  const allocation = (totalCost / buyingPower) * 100;

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="lg"
      overflow="hidden">
      <Tabs
        isFitted
        variant="soft-rounded"
        colorScheme="cyan"
        onChange={(index) => setActiveTab(index)}>
        <TabList p={4} pb={0}>
          <Tab
            _selected={{ bg: "cyan.500", color: "white" }}
            borderRadius="full"
            fontWeight="bold">
            Buy
          </Tab>
          <Tab
            _selected={{ bg: "cyan.500", color: "white" }}
            borderRadius="full"
            fontWeight="bold">
            Sell
          </Tab>
        </TabList>

        <Box p={4}>
          <VStack spacing={4} align="stretch">
            {/* Stock Info */}
            <HStack spacing={3}>
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
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg">
                  {props.symbol}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  Current Price
                </Text>
              </VStack>
              <Text fontSize="2xl" fontWeight="bold" ml="auto">
                {formatter.format(props.price)}
              </Text>
            </HStack>

            <Divider />

            {/* Shares Input */}
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Number of Shares</Text>
                <Tooltip label="Enter the number of shares to trade">
                  <Icon as={Info} boxSize={4} color={textColor} />
                </Tooltip>
              </HStack>
              <NumberInput
                defaultValue={1}
                min={1}
                value={shares}
                onChange={(_, value) => setShares(value)}
                size="lg">
                <NumberInputField
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: accentColor,
                    shadow: `0 0 0 1px ${accentColor}`,
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper borderColor={borderColor} />
                  <NumberDecrementStepper borderColor={borderColor} />
                </NumberInputStepper>
              </NumberInput>
            </VStack>

            {/* Cost Breakdown */}
            <Box
              bg={useColorModeValue("gray.50", "gray.700")}
              p={4}
              borderRadius="lg">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text color={textColor}>Price per share</Text>
                  <Text fontWeight="medium">
                    {formatter.format(props.price)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={textColor}>Number of shares</Text>
                  <Text fontWeight="medium">{shares}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text>Total</Text>
                  <Text color={accentColor}>{formatter.format(totalCost)}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Available Balance */}
            <HStack justify="space-between">
              <Text color={textColor}>
                {activeTab === 0 ? "Buying Power" : "Available Shares"}
              </Text>
              <Badge
                colorScheme={
                  activeTab === 0
                    ? canBuy
                      ? "green"
                      : "red"
                    : canSell
                      ? "green"
                      : "red"
                }
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full">
                {activeTab === 0
                  ? formatter.format(buyingPower)
                  : `${availableShares} shares`}
              </Badge>
            </HStack>

            {activeTab === 0 && buyingPower > 0 && (
              <Progress
                value={Math.min(allocation, 100)}
                colorScheme={canBuy ? "green" : "red"}
                size="sm"
                borderRadius="full"
                hasStripe
              />
            )}

            {/* Action Button */}
            <SlideFade in offsetY="20px">
              <Button
                size="lg"
                width="100%"
                colorScheme={activeTab === 0 ? "green" : "red"}
                onClick={() =>
                  submitTransaction(props.symbol, shares, activeTab === 0)
                }
                isLoading={isLoading}
                loadingText={activeTab === 0 ? "Buying..." : "Selling..."}
                isDisabled={activeTab === 0 ? !canBuy : !canSell}
                leftIcon={<ArrowRight size={18} />}
                borderRadius="full"
                height="14"
                fontSize="lg"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s">
                {activeTab === 0 ? "Buy Shares" : "Sell Shares"}
              </Button>
            </SlideFade>

            {activeTab === 0 && !canBuy && totalCost > 0 && (
              <Text fontSize="sm" color="red.500" textAlign="center">
                Insufficient buying power. You need{" "}
                {formatter.format(totalCost - buyingPower)} more.
              </Text>
            )}

            {activeTab === 1 && !canSell && (
              <Text fontSize="sm" color="red.500" textAlign="center">
                Insufficient shares. You only have {availableShares} shares.
              </Text>
            )}
          </VStack>
        </Box>
      </Tabs>
    </Box>
  );
}

export default TransactionPane;
