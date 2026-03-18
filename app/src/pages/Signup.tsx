// Signup.tsx
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Button,
  Heading,
  Text,
  Link,
  useToast,
  useColorModeValue,
  Icon,
  HStack,
  Progress,
  Checkbox,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserPlus,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import accounts from "../services/accounts.service";
import tokens from "../services/tokens.service";

export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const isPasswordValid =
    formData.password.length >= 8 &&
    /[a-z]/.test(formData.password) &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password);

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

    if (!passwordsMatch) {
      toast({
        title: "Passwords don't match",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Password too weak",
        description: "Please use a stronger password",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Please agree to terms",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await accounts.signup(
        formData.username,
        formData.password,
        turnstileRef.current?.getResponse()!,
      );

      toast({
        title: "Account created!",
        description: "Redirecting to login...",
        status: "success",
        duration: 3000,
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="calc(100vh - 80px)" align="center" justify="center" py={12}>
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
            <Icon as={UserPlus} boxSize={10} />
            <Heading size="lg">Create Account</Heading>
            <Text opacity={0.9}>Join the trading community</Text>
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
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </InputRightElement>
                </InputGroup>

                {/* Password Strength Meter */}
                {formData.password && (
                  <Box mt={2}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">Password Strength</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {passwordStrength}%
                      </Text>
                    </HStack>
                    <Progress
                      value={passwordStrength}
                      colorScheme={
                        passwordStrength < 50
                          ? "red"
                          : passwordStrength < 75
                            ? "yellow"
                            : "green"
                      }
                      borderRadius="full"
                      size="sm"
                    />
                  </Box>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                  {formData.confirmPassword && (
                    <InputRightElement h="full">
                      {passwordsMatch ? (
                        <CheckCircle size={18} color="green" />
                      ) : (
                        <XCircle size={18} color="red" />
                      )}
                    </InputRightElement>
                  )}
                </InputGroup>
              </FormControl>

              {/* Password Requirements */}
              <Box
                w="full"
                p={3}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius="lg">
                <VStack align="start" spacing={1} fontSize="sm">
                  <HStack>
                    {formData.password.length >= 8 ? (
                      <CheckCircle size={14} color="green" />
                    ) : (
                      <XCircle size={14} color="red" />
                    )}
                    <Text>At least 8 characters</Text>
                  </HStack>
                  <HStack>
                    {/[a-z]/.test(formData.password) ? (
                      <CheckCircle size={14} color="green" />
                    ) : (
                      <XCircle size={14} color="red" />
                    )}
                    <Text>Contains lowercase letter</Text>
                  </HStack>
                  <HStack>
                    {/[A-Z]/.test(formData.password) ? (
                      <CheckCircle size={14} color="green" />
                    ) : (
                      <XCircle size={14} color="red" />
                    )}
                    <Text>Contains uppercase letter</Text>
                  </HStack>
                  <HStack>
                    {/[0-9]/.test(formData.password) ? (
                      <CheckCircle size={14} color="green" />
                    ) : (
                      <XCircle size={14} color="red" />
                    )}
                    <Text>Contains number</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box w="full">
                <Turnstile
                  ref={turnstileRef}
                  siteKey="0x4AAAAAACsYYSg7hk35U874"
                />
              </Box>

              <Checkbox
                isChecked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}>
                <Text fontSize="sm">
                  I agree to the{" "}
                  <Link color={accentColor}>Terms of Service</Link> and{" "}
                  <Link color={accentColor}>Privacy Policy</Link>
                </Text>
              </Checkbox>

              <Button
                type="submit"
                size="lg"
                width="full"
                colorScheme="cyan"
                isLoading={isLoading}
                loadingText="Creating account..."
                rightIcon={<ArrowRight size={18} />}
                borderRadius="full"
                height="14"
                fontSize="lg"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s">
                Create Account
              </Button>

              <HStack pt={4}>
                <Text color="gray.500">Already have an account?</Text>
                <Link
                  as={RouterLink}
                  to="/login"
                  color={accentColor}
                  fontWeight="bold">
                  Sign In
                </Link>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
