// Navbar.tsx
import React, { RefObject, useEffect, useRef } from "react";
import {
  HStack,
  Text,
  IconButton,
  useColorMode,
  Flex,
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Stack,
  useColorModeValue,
  Container,
  Badge,
} from "@chakra-ui/react";

import { Link, useLocation, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, LayoutDashboard, Trophy } from "lucide-react";
import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";

export default function Navbar() {
  const { toggleColorMode, colorMode } = useColorMode();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mobileMenuBtn =
    useRef<HTMLButtonElement>() as RefObject<HTMLButtonElement>;

  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.8)",
    "rgba(26, 32, 44, 0.8)",
  );
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = useColorModeValue("cyan.500", "cyan.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    if (isOpen) onClose();
  }, [location]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex="sticky"
      bg={bgColor}
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor={borderColor}>
      <Container maxW="container.xl">
        <HStack py={4} justify="space-between">
          {/* Logo */}
          <Flex gap={8} align="center">
            <Text
              as={Link}
              to="/"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
              display="flex"
              alignItems="center"
              gap={2}>
              {/* SVG Logo */}
              <Box boxSize="32px" display="flex" alignItems="center">
                <svg
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "100%", height: "100%" }}>
                  <circle cx="60" cy="60" r="55" fill="#0F172A" />

                  <rect
                    x="30"
                    y="60"
                    width="8"
                    height="20"
                    rx="2"
                    fill="#22C55E"
                  />
                  <rect
                    x="45"
                    y="50"
                    width="8"
                    height="30"
                    rx="2"
                    fill="#22C55E"
                  />
                  <rect
                    x="60"
                    y="40"
                    width="8"
                    height="40"
                    rx="2"
                    fill="#22C55E"
                  />

                  <path
                    d="M28 65 L45 55 L60 45 L80 30"
                    stroke="#4ADE80"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <g transform="translate(83,28) rotate(-37)">
                    <path d="M0 0 L-9 -5 L-9 5 Z" fill="#4ADE80" />
                  </g>
                </svg>
              </Box>
              Stock<span style={{ color: "#06B6D4" }}>Mart</span>
            </Text>

            {/* Desktop Navigation */}
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path}>
                    <HStack
                      px={4}
                      py={2}
                      borderRadius="full"
                      color={isActive ? activeColor : textColor}
                      bg={isActive ? `${activeColor}10` : "transparent"}
                      _hover={{ bg: `${activeColor}10` }}
                      transition="all 0.2s"
                      spacing={2}>
                      <item.icon size={18} />
                      <Text fontWeight={isActive ? "600" : "500"}>
                        {item.label}
                      </Text>
                    </HStack>
                  </NavLink>
                );
              })}
            </HStack>
          </Flex>

          {/* Search */}
          <Box flex="1" maxW="400px" mx={4}>
            <SearchBox />
          </Box>

          {/* Right Section */}
          <HStack spacing={3}>
            {/* Theme Toggle */}
            <IconButton
              variant="ghost"
              aria-label="Toggle theme"
              icon={
                colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />
              }
              onClick={toggleColorMode}
              rounded="full"
              _hover={{ bg: `${activeColor}10` }}
            />

            {/* Desktop Account Menu */}
            <Box display={{ base: "none", md: "block" }}>
              <AccountMenu />
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              aria-label="Open menu"
              icon={<Menu size={20} />}
              onClick={onOpen}
              rounded="full"
              ref={mobileMenuBtn}
            />
          </HStack>
        </HStack>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={mobileMenuBtn}>
        <DrawerOverlay backdropFilter="blur(10px)" />
        <DrawerContent bg={bgColor} backdropFilter="blur(10px)">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold">
              Menu
            </Text>
          </DrawerHeader>

          <DrawerBody>
            <Stack spacing={4} mt={4}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path} onClick={onClose}>
                    <HStack
                      p={3}
                      borderRadius="lg"
                      bg={isActive ? `${activeColor}10` : "transparent"}
                      color={isActive ? activeColor : textColor}
                      _hover={{ bg: `${activeColor}10` }}
                      spacing={3}>
                      <item.icon size={20} />
                      <Text fontWeight={isActive ? "600" : "500"}>
                        {item.label}
                      </Text>
                    </HStack>
                  </NavLink>
                );
              })}
              <Box pt={4} borderTopWidth="1px" borderColor={borderColor}>
                <AccountMenu />
              </Box>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
