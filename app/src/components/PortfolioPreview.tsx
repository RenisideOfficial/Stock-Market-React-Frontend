// PortfolioPreview.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import accounts from "../services/accounts.service";
import tokens from "../services/tokens.service";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign } from "lucide-react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function PortfolioPreview() {
  const [portfolioValue, setPortfolioValue] = useState(-1);
  const [prevCloseValue, setPrevCloseValue] = useState(0.0);
  const [cash, setCash] = useState(0.0);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    accounts
      .getPortfolio()
      .then(({ portfolioValue, portfolioPrevCloseValue, cash }) => {
        setPortfolioValue(portfolioValue);
        setPrevCloseValue(portfolioPrevCloseValue);
        setCash(cash);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          tokens.clearToken();
          toast({
            title: "Session expired",
            description: "Please login again",
            status: "error",
          });
          navigate("/login");
        }
      });
  }, []);

  const change = portfolioValue - prevCloseValue;
  const changePercent = (change / prevCloseValue) * 100 || 0;
  const isPositive = change >= 0;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <CircularProgress
          isIndeterminate
          color="cyan.500"
          size="80px"
          thickness="4px"
        />
      </Flex>
    );
  }

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={6}
      shadow="lg">
      <VStack spacing={6} align="stretch">
        <Flex gap={8} direction={{ base: "column", md: "row" }}>
          {/* Portfolio Value */}
          <Stat flex="1">
            <StatLabel
              fontSize="sm"
              color={textColor}
              display="flex"
              alignItems="center"
              gap={2}>
              <TrendingUp size={16} />
              Total Investment
            </StatLabel>
            <StatNumber fontSize="4xl" fontWeight="bold">
              {formatter.format(portfolioValue)}
            </StatNumber>
            {portfolioValue > 0 && (
              <StatHelpText>
                <StatArrow type={isPositive ? "increase" : "decrease"} />
                {formatter.format(Math.abs(change))} ({changePercent.toFixed(2)}
                %)
              </StatHelpText>
            )}
          </Stat>

          {/* Cash */}
          <Stat flex="1">
            <StatLabel
              fontSize="sm"
              color={textColor}
              display="flex"
              alignItems="center"
              gap={2}>
              <DollarSign size={16} />
              Buying Power
            </StatLabel>
            <StatNumber fontSize="4xl" fontWeight="bold">
              {formatter.format(cash)}
            </StatNumber>
            <StatHelpText>Available to trade</StatHelpText>
          </Stat>
        </Flex>

        {portfolioValue === 0 && (
          <Box
            p={4}
            bg="cyan.50"
            _dark={{ bg: "cyan.900" }}
            borderRadius="lg"
            textAlign="center">
            <Text
              color="cyan.600"
              _dark={{ color: "cyan.200" }}
              fontWeight="medium">
              🚀 Start trading to build your portfolio!
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default PortfolioPreview;
