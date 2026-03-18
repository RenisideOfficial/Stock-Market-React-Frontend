// Login.tsx
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  Link,
  HStack,
  useToast,
  useColorModeValue,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  Fade,
  ScaleFade,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Eye, EyeOff, LogIn, TrendingUp, ArrowRight } from "lucide-react";
import accounts from "../services/accounts.service";
import tokens from "../services/tokens.service";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

export default function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  useEffect(() => {
    if (tokens.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  useLayoutEffect(() => {
    return () => {
      turnstileRef.current?.remove();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await accounts.login(
        formData.username,
        formData.password,
        turnstileRef.current?.getResponse()!,
      );

      if (res === "success") {
        toast({
          title: "Welcome back!",
          description: "Redirecting to dashboard...",
          status: "success",
          duration: 3000,
          position: "top-right",
        });
        navigate("/");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message,
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="calc(100vh - 80px)" align="center" justify="center" py={12}>
      <ScaleFade in>
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          shadow="2xl"
          maxW="md"
          w="full"
          overflow="hidden">
          {/* Header */}
          <Box bg={accentColor} p={6} color="white">
            <VStack spacing={2}>
              <Icon as={TrendingUp} boxSize={10} />
              <Heading size="lg">Welcome Back</Heading>
              <Text opacity={0.9}>Sign in to continue trading</Text>
            </VStack>
          </Box>

          {/* Form */}
          <Box p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    size="lg"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: accentColor,
                      shadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: accentColor,
                        shadow: `0 0 0 1px ${accentColor}`,
                      }}
                    />
                    <InputRightElement h="full">
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm">
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Box w="full" py={2}>
                  <Turnstile
                    ref={turnstileRef}
                    siteKey="0x4AAAAAACsYYSg7hk35U874"
                  />
                </Box>

                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  colorScheme="cyan"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  rightIcon={<ArrowRight size={18} />}
                  borderRadius="full"
                  height="14"
                  fontSize="lg"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s">
                  Sign In
                </Button>

                <HStack pt={4}>
                  <Text color="gray.500">Don't have an account?</Text>
                  <Link
                    as={RouterLink}
                    to="/signup"
                    color={accentColor}
                    fontWeight="bold">
                    Create Account
                  </Link>
                </HStack>
              </VStack>
            </form>
          </Box>
        </Box>
      </ScaleFade>
    </Flex>
  );
}
