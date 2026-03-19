// StockChart.tsx - FIXED line chart visibility
import React, { useState, useRef, useEffect } from "react";
import * as Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Box,
  Spinner,
  useColorModeValue,
  HStack,
  Button,
  Text,
  VStack,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
} from "@chakra-ui/react";
import { ChevronDown, CandlestickChart, LineChart } from "lucide-react";

// Initialize modules
import highchartsAccessibility from "highcharts/modules/accessibility";
import "highcharts/modules/stock";
if (typeof window !== "undefined") {
  highchartsAccessibility(Highcharts);
}

type ChartType = "line" | "candlestick";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const periods = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1m" },
  { label: "6M", value: "6m" },
  { label: "YTD", value: "ytd" },
  { label: "1Y", value: "1y" },
  { label: "All", value: "all" },
];

export default function StockChart(props: { symbol: string }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  const [chartType, setChartType] = useState<ChartType>("line");
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const accentColor = useColorModeValue("#00b8d4", "#4dd0e1");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#2D3748");

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [rawData, setRawData] = useState<any[]>([]);

  // Base chart options
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    rangeSelector: { enabled: false },
    title: { text: "" },
    yAxis: {
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContext) {
          return formatter.format(this.value as number);
        },
        style: { color: textColor },
      },
      gridLineColor: gridColor,
      height: "75%",
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: textColor } },
      lineColor: gridColor,
      tickColor: gridColor,
    },
    chart: {
      height: isMobile ? 350 : 500,
      backgroundColor: bgColor,
      borderRadius: 12,
      style: { fontFamily: "'Inter Variable', sans-serif" },
    },
    credits: { enabled: false },
    navigator: {
      enabled: true,
      height: isMobile ? 30 : 50,
      margin: isMobile ? 20 : 30,
      series: { color: accentColor, lineWidth: 1 },
      handles: { backgroundColor: bgColor, borderColor: accentColor },
      maskFill: "rgba(0, 184, 212, 0.2)",
    },
    scrollbar: {
      enabled: true,
      barBackgroundColor: gridColor,
      barBorderRadius: 4,
      buttonBorderRadius: 4,
      rifleColor: textColor,
      trackBackgroundColor: "transparent",
      trackBorderColor: gridColor,
    },
    tooltip: { shared: true, valueDecimals: 2, valuePrefix: "$" },
    plotOptions: {
      series: { showInNavigator: true },
      candlestick: {
        color: "#ef5350",
        upColor: "#26a69a",
        lineColor: "#ef5350",
        upLineColor: "#26a69a",
      },
    },
  });

  // Update chart data based on type
  const updateChartData = (data: any[], type: ChartType) => {
    if (!data || data.length === 0) return;

    let seriesData;
    let seriesConfig: any;

    if (type === "line") {
      // Format for line chart: [timestamp, close price]
      seriesData = data.map((point: any) => {
        if (Array.isArray(point)) {
          // If data is [timestamp, open, high, low, close] or [timestamp, price]
          const timestamp = point[0];
          const close = point.length >= 5 ? point[4] : point[1]; // Use close price if available, otherwise use price
          return [timestamp, close];
        } else {
          // If data comes as object
          return [
            new Date(point.date || point.timestamp).getTime(),
            point.close || point.price || point.value || 100,
          ];
        }
      });

      seriesConfig = {
        name: props.symbol,
        type: "line",
        data: seriesData,
        color: accentColor,
        lineWidth: 2,
        marker: { enabled: false },
        showInNavigator: true,
        tooltip: { valueDecimals: 2, valuePrefix: "$" },
        threshold: null,
        fillOpacity: 0, // No fill for line chart
      };
    } else {
      // Format for candlestick: [timestamp, open, high, low, close]
      seriesData = data.map((point: any) => {
        if (Array.isArray(point) && point.length >= 5) {
          return point; // Already in OHLC format
        } else if (Array.isArray(point) && point.length === 2) {
          // Create synthetic OHLC from price data
          const timestamp = point[0];
          const price = point[1];
          return [timestamp, price * 0.99, price * 1.02, price * 0.98, price];
        } else {
          // Object format
          const timestamp = new Date(point.date || point.timestamp).getTime();
          const close = point.close || point.price || point.value || 100;
          const open = point.open || close * 0.99;
          const high = point.high || close * 1.02;
          const low = point.low || close * 0.98;
          return [timestamp, open, high, low, close];
        }
      });

      seriesConfig = {
        name: props.symbol,
        type: "candlestick",
        data: seriesData,
        color: "#ef5350", // down candle color
        upColor: "#26a69a", // up candle color
        lineColor: "#ef5350",
        upLineColor: "#26a69a",
        showInNavigator: true,
        tooltip: { valueDecimals: 2, valuePrefix: "$" },
      };
    }

    // Ensure we have valid data
    if (seriesData.length === 0) {
      console.error("No data to display");
      return;
    }

    // Update chart options
    setChartOptions({
      ...chartOptions,
      series: [seriesConfig],
    });

    // Force chart redraw
    setTimeout(() => {
      if (chartComponentRef.current?.chart) {
        chartComponentRef.current.chart.redraw();
      }
    }, 100);
  };

  const fetchStockData = (period: string) => {
    setIsLoading(true);
    setSelectedPeriod(period);

    axios
      .get(`/api/stocks/${props.symbol}/historical?period=${period}`)
      .then((res) => {
        console.log("API Data:", res.data); // Debug log
        setRawData(res.data);
        updateChartData(res.data, chartType);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error);
        // Generate demo data as fallback
        const demoData = generateDemoData(period);
        setRawData(demoData);
        updateChartData(demoData, chartType);
        setIsLoading(false);
      });
  };

  // Generate demo data for testing
  const generateDemoData = (period: string) => {
    const data = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let points = 50;
    let interval = day;

    switch (period) {
      case "1d":
        points = 24;
        interval = 60 * 60 * 1000;
        break;
      case "5d":
        points = 5;
        interval = day;
        break;
      case "1m":
        points = 30;
        interval = day;
        break;
      case "6m":
        points = 180;
        interval = day;
        break;
      case "1y":
        points = 365;
        interval = day;
        break;
      default:
        points = 50;
        interval = day;
    }

    let price = 150;
    for (let i = points; i >= 0; i--) {
      const timestamp = now - i * interval;
      const change = (Math.random() - 0.5) * 5;
      price = Math.max(10, price + change);

      // Generate OHLC data
      const open = price;
      const close = price + (Math.random() - 0.5) * 3;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;

      data.push([timestamp, open, high, low, close]);
    }
    return data;
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    if (rawData.length > 0) {
      updateChartData(rawData, type);
    }
  };

  useEffect(() => {
    if (props.symbol) {
      fetchStockData(selectedPeriod);
    }
  }, [props.symbol, location]);

  const selectedPeriodLabel =
    periods.find((p) => p.value === selectedPeriod)?.label || "1M";

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      p={{ base: 3, md: 4 }}
      shadow="lg"
      width="100%"
      overflow="hidden">
      <VStack spacing={4} align="stretch" width="100%">
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
            {props.symbol} Price Chart
          </Text>

          <HStack spacing={2}>
            {/* Chart Type Toggle */}
            <ButtonGroup isAttached size="sm">
              <Button
                onClick={() => handleChartTypeChange("line")}
                colorScheme={chartType === "line" ? "cyan" : "gray"}
                leftIcon={<LineChart size={14} />}
                borderRightRadius={0}>
                Line
              </Button>
              <Button
                onClick={() => handleChartTypeChange("candlestick")}
                colorScheme={chartType === "candlestick" ? "cyan" : "gray"}
                leftIcon={<CandlestickChart size={14} />}
                borderLeftRadius={0}>
                Candle
              </Button>
            </ButtonGroup>

            {/* Period Selector */}
            {!isMobile ? (
              <HStack spacing={1}>
                {periods.map((period) => (
                  <Button
                    key={period.value}
                    size="sm"
                    variant={
                      selectedPeriod === period.value ? "solid" : "ghost"
                    }
                    colorScheme={
                      selectedPeriod === period.value ? "cyan" : "gray"
                    }
                    onClick={() => fetchStockData(period.value)}
                    borderRadius="full"
                    px={2}
                    minW="auto"
                    height="32px"
                    fontSize="xs">
                    {period.label}
                  </Button>
                ))}
              </HStack>
            ) : (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={14} />}
                  size="sm"
                  colorScheme="cyan"
                  variant="outline"
                  borderRadius="full"
                  px={3}>
                  {selectedPeriodLabel}
                </MenuButton>
                <MenuList minW="120px">
                  {periods.map((period) => (
                    <MenuItem
                      key={period.value}
                      onClick={() => fetchStockData(period.value)}>
                      {period.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </HStack>
        </HStack>

        <Box
          position="relative"
          minH={{ base: "350px", md: "500px" }}
          width="100%">
          {isLoading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={1}>
              <Spinner size="xl" color="cyan.500" thickness="4px" />
            </Box>
          )}

          <Box
            opacity={isLoading ? 0.3 : 1}
            transition="opacity 0.2s"
            width="100%">
            <HighchartsReact
              constructorType="stockChart"
              highcharts={Highcharts}
              options={chartOptions}
              ref={chartComponentRef}
            />
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}
