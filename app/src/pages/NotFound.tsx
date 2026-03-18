// NotFound.tsx
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { Home, Frown } from "lucide-react";

export default function NotFound() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  return (
    <Container maxW="container.md" py={20}>
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="2xl"
        p={12}
        textAlign="center">
        <VStack spacing={6}>
          <Icon as={Frown} boxSize={24} color={accentColor} />

          <Heading
            size="4xl"
            bgGradient={`linear(to-r, ${accentColor}, purple.500)`}
            bgClip="text">
            404
          </Heading>

          <VStack spacing={2}>
            <Heading size="xl">Page Not Found</Heading>
            <Text color="gray.500" fontSize="lg">
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </VStack>

          <Button
            as={Link}
            to="/"
            size="lg"
            colorScheme="cyan"
            leftIcon={<Home size={18} />}
            borderRadius="full"
            px={8}
            py={6}
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s">
            Back to Home
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}
