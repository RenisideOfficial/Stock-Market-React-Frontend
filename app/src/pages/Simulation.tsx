import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Spinner,
  useColorModeValue,
  Tooltip,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormLabel,
  Divider,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Progress,
  useToast,
} from "@chakra-ui/react";
import * as Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import highchartsAccessibility from "highcharts/modules/accessibility";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Zap,
} from "lucide-react";

if (typeof window !== "undefined") {
  highchartsAccessibility(Highcharts);
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface AgentSnapshot {
  id: number;
  name: string;
  agent_type: string;
  cash: number;
  shares: number;
  total_value: number;
  trades_made: number;
  initial_cash: number;
  pnl: number;
  pnl_percent: number;
}
interface PricePoint {
  tick: number;
  price: number;
  volume: number;
  timestamp: string;
}

interface SimulationState {
  status: string;
  tick: number;
  current_price: number;
  total_change_percent: number;
  is_crashing: boolean;
  is_bubble: boolean;
  agents: AgentSnapshot[];
  order_book: {
    best_bid: number | null;
    best_ask: number | null;
    bid_volume: number;
    ask_volume: number;
    spread: number;
  };
  recent_prices: PricePoint[];
}

const AGENT_COLORS: Record<string, string> = {
  RandomTrader: "#a78bfa",
  TrendFollower: "#34d399",
  MeanReversion: "#60a5fa",
  PanicSeller: "#f87171",
  LongTermInvestor: "#fbbf24",
};

const AGENT_DESCRIPTIONS: Record<string, string> = {
  RandomTrader: "Trades randomly — creates market noise",
  TrendFollower: "Follows price trends — can cause bubbles",
  MeanReversion: "Bets on price returning to average — stabilizes market",
  PanicSeller: "Calm until a crash, then dumps everything",
  LongTermInvestor: "Buys steadily regardless of price — provides floor",
};

export default function Simulation() {
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tickSpeed, setTickSpeed] = useState(500);
  const [priceData, setPriceData] = useState<number[][]>([]);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("#00b8d4", "#4dd0e1");
  const textColor = useColorModeValue("gray.900", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#2D3748");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const agentCardBg = useColorModeValue("gray.50", "gray.700");

  const [chartOptions] = useState<Highcharts.Options>({
    rangeSelector: { enabled: false },
    title: { text: "" },
    chart: {
      height: 350,
      backgroundColor: "transparent",
      borderRadius: 12,
      animation: false,
    },
    xAxis: {
      title: { text: "Tick" },
      type: "linear",
    },
    yAxis: {
      title: { text: "Price ($)" },
      labels: {
        formatter: function (this: any) {
          return "$" + this.value.toFixed(2);
        },
      },
    },
    series: [
      {
        name: "Market Price",
        type: "spline",
        data: [],
        color: accentColor,
        lineWidth: 2,
        marker: { enabled: false },
        animation: false,
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      formatter: function (this: any) {
        return `Tick ${this.x}: $${this.y.toFixed(2)}`;
      },
    },
    plotOptions: {
      series: { animation: false },
    },
  });

  const fetchState = useCallback(async () => {
    try {
      const res = await axios.get("/api/simulation/state");
      setSimState(res.data);

      // Update chart data
      if (res.data.recent_prices && res.data.recent_prices.length > 0) {
        const newData = res.data.recent_prices.map((p: PricePoint) => [
          p.tick,
          p.price,
        ]);
        setPriceData(newData);

        if (chartRef.current?.chart) {
          chartRef.current.chart.series[0]?.setData(newData, true, false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch simulation state", err);
    }
  }, []);

  const handleStart = async () => {
    try {
      await axios.post("/api/simulation/start", null);
      setIsRunning(true);
      toast({
        title: "Simulation Started",
        description: "AI traders are now active",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
    } catch (err) {
      toast({ title: "Failed to start", status: "error", duration: 2000 });
    }
  };

  const handleStop = async () => {
    try {
      await axios.post("/api/simulation/stop");
      setIsRunning(false);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      toast({
        title: "Simulation Stopped",
        status: "info",
        duration: 2000,
        position: "top-right",
      });
    } catch (err) {
      toast({ title: "Failed to stop", status: "error", duration: 2000 });
    }
  };

  const handlePause = async () => {
    try {
      await axios.post("/api/simulation/pause");
      setIsRunning(false);
      toast({
        title: "Simulation Paused",
        status: "warning",
        duration: 2000,
        position: "top-right",
      });
    } catch (err) {
      toast({ title: "Failed to pause", status: "error", duration: 2000 });
    }
  };

  const handleReset = async () => {
    try {
      await axios.post("/api/simulation/reset");
      setIsRunning(false);
      setPriceData([]);
      setSimState(null);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (chartRef.current?.chart) {
        chartRef.current?.chart?.series[0]?.setData([], true);
      }
      toast({
        title: "Simulation Reset",
        status: "info",
        duration: 2000,
        position: "top-right",
      });
    } catch (err) {
      toast({ title: "Failed to reset", status: "error", duration: 2000 });
    }
  };

  // Tick loop — posts to /tick and fetches state
  useEffect(() => {
    if (isRunning) {
      tickIntervalRef.current = setInterval(async () => {
        try {
          await axios.post("/api/simulation/tick");
          await fetchState();
        } catch (err) {
          console.error("Tick failed", err);
        }
      }, tickSpeed);
    } else {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    }

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [isRunning, tickSpeed, fetchState]);

  // Fetch initial state on mount
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const statusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "green";
      case "Paused":
        return "yellow";
      case "Stopped":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box w="full" pb={10}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <VStack align="start" spacing={0}>
            <HStack>
              <Icon as={Bot} color={accentColor} boxSize={6} />
              <Heading size="lg">AI Market Simulation</Heading>
            </HStack>
            <Text color={subTextColor} fontSize="sm">
              Watch autonomous trading agents interact and form market prices
            </Text>
          </VStack>

          {simState && (
            <Badge
              colorScheme={statusColor(simState.status)}
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full">
              {simState.status}
            </Badge>
          )}
        </HStack>

        {/* Market crash / bubble alerts */}
        {simState?.is_crashing && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <Text fontWeight="bold">Market Crash Detected!</Text>
            <Text ml={2}>Price has dropped more than 20% from peak</Text>
          </Alert>
        )}
        {simState?.is_bubble && (
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <Text fontWeight="bold">Bubble Warning!</Text>
            <Text ml={2}>Price has risen more than 50% from initial value</Text>
          </Alert>
        )}

        {/* Controls */}
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          p={5}
          shadow="md">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack spacing={3}>
                <Button
                  leftIcon={<Play size={16} />}
                  colorScheme="green"
                  onClick={handleStart}
                  isDisabled={isRunning}
                  borderRadius="full">
                  Start
                </Button>
                <Button
                  leftIcon={<Pause size={16} />}
                  colorScheme="yellow"
                  onClick={handlePause}
                  isDisabled={!isRunning}
                  borderRadius="full">
                  Pause
                </Button>
                <Button
                  leftIcon={<Square size={16} />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleStop}
                  isDisabled={!isRunning && simState?.status !== "Paused"}
                  borderRadius="full">
                  Stop
                </Button>
                <Button
                  leftIcon={<RotateCcw size={16} />}
                  variant="ghost"
                  onClick={handleReset}
                  borderRadius="full">
                  Reset
                </Button>
              </HStack>

              {/* Speed control */}
              <HStack spacing={3} minW="200px">
                <Zap size={16} color={accentColor} />
                <Text fontSize="sm" whiteSpace="nowrap">
                  Speed: {tickSpeed}ms
                </Text>
                <Slider
                  min={100}
                  max={2000}
                  step={100}
                  value={tickSpeed}
                  onChange={setTickSpeed}
                  w="120px">
                  <SliderTrack>
                    <SliderFilledTrack bg={accentColor} />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Stats row */}
        {simState && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              p={4}
              shadow="md">
              <Stat>
                <StatLabel color={subTextColor}>Current Price</StatLabel>
                <StatNumber fontSize="xl">
                  {formatter.format(simState.current_price)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      simState.total_change_percent >= 0
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {simState.total_change_percent.toFixed(2)}%
                </StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              p={4}
              shadow="md">
              <Stat>
                <StatLabel color={subTextColor}>Tick</StatLabel>
                <StatNumber fontSize="xl">{simState.tick}</StatNumber>
                <StatHelpText>Market steps</StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              p={4}
              shadow="md">
              <Stat>
                <StatLabel color={subTextColor}>Best Bid</StatLabel>
                <StatNumber fontSize="xl" color="green.400">
                  {simState.order_book.best_bid
                    ? formatter.format(simState.order_book.best_bid)
                    : "—"}
                </StatNumber>
                <StatHelpText>Highest buy order</StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              p={4}
              shadow="md">
              <Stat>
                <StatLabel color={subTextColor}>Best Ask</StatLabel>
                <StatNumber fontSize="xl" color="red.400">
                  {simState.order_book.best_ask
                    ? formatter.format(simState.order_book.best_ask)
                    : "—"}
                </StatNumber>
                <StatHelpText>Lowest sell order</StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>
        )}

        {/* Chart + Agent Leaderboard */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Price Chart */}
          <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={5}
            shadow="md">
            <HStack mb={4}>
              <Icon as={Activity} color={accentColor} />
              <Heading size="sm">Live Price Chart</Heading>
            </HStack>
            {priceData.length === 0 ? (
              <VStack justify="center" h="300px" spacing={3}>
                <Icon as={Activity} boxSize={10} color="gray.300" />
                <Text color={subTextColor}>
                  Start the simulation to see live price formation
                </Text>
              </VStack>
            ) : (
              <HighchartsReact
                constructorType="chart"
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
              />
            )}
          </Box>

          {/* Agent Leaderboard */}
          <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={5}
            shadow="md">
            <HStack mb={4}>
              <Icon as={Users} color={accentColor} />
              <Heading size="sm">Agent Standings</Heading>
            </HStack>
            {!simState || simState.agents.length === 0 ? (
              <VStack justify="center" h="300px" spacing={3}>
                <Icon as={Bot} boxSize={10} color="gray.300" />
                <Text color={subTextColor}>
                  Agents will appear when simulation starts
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {[...simState.agents]
                  .sort((a, b) => b.total_value - a.total_value)
                  .map((agent, index) => (
                    <Box
                      key={agent.id}
                      p={3}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg={agentCardBg}>
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Box
                            w={8}
                            h={8}
                            borderRadius="full"
                            bg={AGENT_COLORS[agent.agent_type] || accentColor}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            color="white">
                            #{index + 1}
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm">
                              {agent.name}
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                              {agent.trades_made} trades
                            </Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">
                            {formatter.format(agent.total_value)}
                          </Text>
                          <HStack spacing={1}>
                            {agent.pnl >= 0 ? (
                              <TrendingUp size={12} color="#48BB78" />
                            ) : (
                              <TrendingDown size={12} color="#F56565" />
                            )}
                            <Text
                              fontSize="xs"
                              color={agent.pnl >= 0 ? "green.400" : "red.400"}
                              fontWeight="500">
                              {agent.pnl_percent.toFixed(2)}%
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Progress
                        mt={2}
                        value={Math.min(
                          Math.max(
                            (agent.total_value / agent.initial_cash) * 50,
                            0,
                          ),
                          100,
                        )}
                        colorScheme={agent.pnl >= 0 ? "green" : "red"}
                        size="xs"
                        borderRadius="full"
                      />
                    </Box>
                  ))}
              </VStack>
            )}
          </Box>
        </SimpleGrid>

        {/* Agent Info Cards */}
        <Box>
          <Heading size="sm" mb={4}>
            Agent Strategies
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
            {Object.entries(AGENT_DESCRIPTIONS).map(([type, desc]) => (
              <Box
                key={type}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                p={4}
                shadow="sm"
                borderTopWidth="3px"
                borderTopColor={AGENT_COLORS[type]}>
                <VStack align="start" spacing={2}>
                  <Box
                    w={8}
                    h={8}
                    borderRadius="lg"
                    bg={AGENT_COLORS[type]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center">
                    <Bot size={16} color="white" />
                  </Box>
                  <Text fontWeight="bold" fontSize="sm">
                    {type}
                  </Text>
                  <Text fontSize="xs" color={subTextColor}>
                    {desc}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
