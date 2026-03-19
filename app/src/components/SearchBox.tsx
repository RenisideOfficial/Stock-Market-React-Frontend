import React, { KeyboardEvent as KE, useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Box,
  Kbd,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, TrendingUp } from "lucide-react";

interface SearchResult {
  symbol: string;
  longname: string;
}

function SearchBox() {
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("cyan.50", "cyan.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  const onKeyDown = (e: KE<HTMLInputElement>) => {
    if (results.length < 1) return;

    if (e.key === "Enter") {
      const selection = results[selectedIndex];
      if (selection) {
        navigate(`/stocks/${selection.symbol}`);
        initialFocusRef.current?.blur();
        onClose();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    if (query === "") {
      setResults([]);
      return;
    }

    const searchForStock = setTimeout(() => {
      axios
        .get(`/api/stocks/search/${query}`)
        .then((res: { data: SearchResult[] }) => {
          setResults(res.data);
          setSelectedIndex(0); // Always reset index on new results
        });
    }, 300);

    return () => clearTimeout(searchForStock);
  }, [query]);

  const location = useLocation();
  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/stocks/") && initialFocusRef.current) {
      const stockSymbol = path.split("/")[2];
      initialFocusRef.current.value = stockSymbol || "";
    } else if (initialFocusRef.current) {
      initialFocusRef.current.value = "";
    }
    onClose();
  }, [location, onClose]);

  // Logic: Show popover if user has typed something
  const shouldShowPopover = isOpen && query.length > 0;

  return (
    <Popover
      initialFocusRef={initialFocusRef}
      isOpen={shouldShowPopover}
      onClose={onClose}
      placement="bottom-start"
      autoFocus={false}
      matchWidth={false}>
      <PopoverTrigger>
        <InputGroup w="full">
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search stocks (e.g., AAPL)"
            ref={initialFocusRef}
            onFocus={onOpen}
            onBlur={() => setTimeout(onClose, 200)} // Delay allows Link clicks to register
            onKeyDown={onKeyDown}
            onChange={(e) => setQuery(e.target.value)}
            borderRadius="full"
            bg={bgColor}
            borderColor={borderColor}
            _focus={{
              borderColor: accentColor,
              boxShadow: `0 0 0 1px ${accentColor}`,
            }}
            pl={10}
          />
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent
        bg={bgColor}
        borderColor={borderColor}
        shadow="xl"
        borderRadius="xl"
        w="400px"
        mt={1}
        _focus={{ outline: "none" }}>
        <PopoverArrow bg={bgColor} />
        <PopoverBody p={0}>
          {results.length > 0 ? (
            <VStack align="stretch" spacing={0}>
              {results.map((stock, i) => (
                <Link key={stock.symbol} to={`/stocks/${stock.symbol}`}>
                  <HStack
                    p={3}
                    bg={selectedIndex === i ? selectedBg : "transparent"}
                    _hover={{ bg: hoverBg }}
                    spacing={3}
                    borderBottomWidth={i < results.length - 1 ? "1px" : "0"}
                    borderBottomColor={borderColor}>
                    <Box
                      bg={accentColor}
                      w={8}
                      h={8}
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center">
                      <TrendingUp size={16} color="white" />
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="bold">{stock.symbol}</Text>
                      <Text fontSize="sm" color={textColor} noOfLines={1}>
                        {stock.longname}
                      </Text>
                    </VStack>
                    {selectedIndex === i && (
                      <HStack spacing={1} color={textColor} fontSize="xs">
                        <Kbd>↵</Kbd>
                      </HStack>
                    )}
                  </HStack>
                </Link>
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign="center">
              <Text color={textColor} fontSize="sm">
                No results found for "{query}"
              </Text>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
      {/* No results message - make it responsive */}
      {isOpen && query !== "" && results.length === 0 && (
        <Box
          position="absolute"
          zIndex="popover"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          shadow="xl"
          w={{ base: "calc(100vw - 32px)", md: "400px" }}
          maxW="400px"
          mt={1}
          p={4}
          textAlign="center">
          <Text color={textColor}>No results found</Text>
        </Box>
      )}
    </Popover>
  );
}

export default SearchBox;
