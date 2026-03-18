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
  IconButton,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";

// Initialize modules
import highchartsAccessibility from "highcharts/modules/accessibility";
if (typeof window !== "undefined") {
  highchartsAccessibility(Highcharts);
}

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
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const accentColor = useColorModeValue("#00b8d4", "#4dd0e1");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#2D3748");

  // Responsive breakpoint
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    rangeSelector: {
      enabled: false,
    },
    title: {
      text: "",
    },
    yAxis: {
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContext) {
          return formatter.format(this.value as number);
        },
        style: {
          color: textColor,
        },
      },
      gridLineColor: gridColor,
      height: "75%",
    },
    xAxis: {
      type: "datetime",
      labels: {
        style: {
          color: textColor,
        },
      },
      lineColor: gridColor,
      tickColor: gridColor,
    },
    chart: {
      height: isMobile ? 350 : 500,
      backgroundColor: bgColor,
      borderRadius: 12,
      style: {
        fontFamily: "'Inter Variable', sans-serif",
      },
    },
    credits: {
      enabled: false,
    },
    navigator: {
      enabled: true,
      height: isMobile ? 30 : 50,
      margin: isMobile ? 20 : 30,
      series: {
        color: accentColor,
        lineWidth: 1,
      },
      handles: {
        backgroundColor: bgColor,
        borderColor: accentColor,
      },
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
    tooltip: {
      shared: true,
      valueDecimals: 2,
      valuePrefix: "$",
    },
    plotOptions: {
      series: {
        showInNavigator: true,
        lineWidth: 2,
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
    },
  });

  const fetchStockData = (period: string) => {
    setIsLoading(true);
    setSelectedPeriod(period);

    axios
      .get(`/api/stocks/${props.symbol}/historical?period=${period}`)
      .then((res) => {
        // Ensure data is in the correct format [timestamp, value]
        const formattedData = res.data.map((point: any) => {
          if (Array.isArray(point)) {
            return point;
          }
          // If data comes as object with date and price
          return [
            new Date(point.date || point.timestamp).getTime(),
            point.price || point.value || point.close,
          ];
        });

        setChartOptions({
          ...chartOptions,
          series: [
            {
              name: props.symbol,
              type: "line",
              data: formattedData,
              color: accentColor,
              lineWidth: 2,
              showInNavigator: true,
              tooltip: {
                valueDecimals: 2,
                valuePrefix: "$",
              },
              marker: {
                enabled: false,
              },
              threshold: null,
            },
          ],
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error);
        setIsLoading(false);

        // Set fallback demo data if API fails (for testing)
        const demoData = generateDemoData(period);
        setChartOptions({
          ...chartOptions,
          series: [
            {
              name: props.symbol,
              type: "line",
              data: demoData,
              color: accentColor,
              lineWidth: 2,
              showInNavigator: true,
            },
          ],
        });
      });
  };

  // Generate demo data for testing when API fails
  const generateDemoData = (period: string) => {
    const data = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let points = 30;
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
        points = 30;
        interval = day;
    }

    let basePrice = 150;
    for (let i = points; i >= 0; i--) {
      const timestamp = now - i * interval;
      const change = (Math.random() - 0.5) * 10;
      basePrice += change;
      data.push([timestamp, Math.max(1, basePrice)]);
    }
    return data;
  };

  useEffect(() => {
    if (props.symbol) {
      fetchStockData(selectedPeriod);
    }
  }, [props.symbol, location]);

  // Get the selected period label for mobile dropdown
  const selectedPeriodLabel =
    periods.find((p) => p.value === selectedPeriod)?.label || "1M";

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      p={{ base: 3, md: 4 }}
      shadow="lg">
      <VStack spacing={4} align="stretch">
        <HStack
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "row" }}
          spacing={{ base: 2, sm: 2 }}>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
            {props.symbol} Price Chart
          </Text>

          {/* Desktop period selector */}
          {!isMobile && (
            <HStack spacing={1} flexWrap="wrap" justify="flex-end">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  size="sm"
                  variant={selectedPeriod === period.value ? "solid" : "ghost"}
                  colorScheme={
                    selectedPeriod === period.value ? "cyan" : "gray"
                  }
                  onClick={() => fetchStockData(period.value)}
                  borderRadius="full"
                  px={3}
                  minW="auto"
                  height="32px"
                  fontSize="sm"
                  _hover={{ transform: "translateY(-1px)" }}>
                  {period.label}
                </Button>
              ))}
            </HStack>
          )}

          {/* Mobile period selector dropdown */}
          {isMobile && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDown size={16} />}
                size="sm"
                colorScheme="cyan"
                variant="outline"
                borderRadius="full"
                px={4}
                width="100%">
                {selectedPeriodLabel}
              </MenuButton>
              <MenuList minW="120px">
                {periods.map((period) => (
                  <MenuItem
                    key={period.value}
                    onClick={() => fetchStockData(period.value)}
                    bg={
                      selectedPeriod === period.value
                        ? "cyan.50"
                        : "transparent"
                    }
                    color={
                      selectedPeriod === period.value ? "cyan.500" : "inherit"
                    }
                    fontWeight={
                      selectedPeriod === period.value ? "bold" : "normal"
                    }>
                    {period.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </HStack>

        <Box position="relative" minH={{ base: "350px", md: "500px" }}>
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

          <Box opacity={isLoading ? 0.3 : 1} transition="opacity 0.2s">
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
