// Navbar.tsx - FIXED
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
} from "@chakra-ui/react";

import { Link, useLocation, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, LayoutDashboard, Trophy, Bot } from "lucide-react";
import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";

export default function Navbar() {
  const { toggleColorMode, colorMode } = useColorMode();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mobileMenuBtn = useRef<HTMLButtonElement>(null);

  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(26, 32, 44, 0.95)",
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
    { path: "/simulation", label: "Simulation", icon: Bot },
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
      borderColor={borderColor}
      width="100%">
      <Container maxW="container.xl" px={{ base: 3, md: 4 }}>
        <Flex py={3} align="center" justify="space-between" gap={2}>
          {/* Logo Section */}
          <Flex align="center" gap={{ base: 1, md: 4 }} minW="fit-content">
            <Text
              as={Link}
              to="/"
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              display="flex"
              alignItems="center"
              gap={1}
              whiteSpace="nowrap">
              {/* SVG Logo - smaller on mobile */}
              <Box
                boxSize={{ base: "28px", md: "32px" }}
                display="flex"
                alignItems="center"
                mr={1}>
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
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                Stock
              </Text>
              <Text
                as="span"
                color="#06B6D4"
                display={{ base: "none", sm: "inline" }}>
                Mart
              </Text>
              {/* Show just "S" on very small screens */}
              <Text
                as="span"
                display={{ base: "inline", sm: "none" }}
                color="#06B6D4">
                S
              </Text>
            </Text>

            {/* Desktop Navigation */}
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path}>
                    <HStack
                      px={3}
                      py={2}
                      borderRadius="full"
                      color={isActive ? activeColor : textColor}
                      bg={isActive ? `${activeColor}10` : "transparent"}
                      _hover={{ bg: `${activeColor}10` }}
                      transition="all 0.2s"
                      spacing={1.5}>
                      <item.icon size={16} />
                      <Text fontSize="sm" fontWeight={isActive ? "600" : "500"}>
                        {item.label}
                      </Text>
                    </HStack>
                  </NavLink>
                );
              })}
            </HStack>
          </Flex>

          {/* Search Box - properly sized */}
          <Box flex="1" maxW={{ base: "160px", sm: "240px", md: "400px" }}>
            <SearchBox />
          </Box>

          {/* Right Section */}
          <HStack spacing={{ base: 1, md: 2 }} minW="fit-content">
            {/* Theme Toggle */}
            <IconButton
              variant="ghost"
              aria-label="Toggle theme"
              icon={
                colorMode === "light" ? <Moon size={18} /> : <Sun size={18} />
              }
              onClick={toggleColorMode}
              rounded="full"
              size="sm"
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
              icon={<Menu size={18} />}
              onClick={onOpen}
              rounded="full"
              size="sm"
              ref={mobileMenuBtn}
            />
          </HStack>
        </Flex>
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
            <HStack>
              <Box boxSize="24px">
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
                </svg>
              </Box>
              <Text fontSize="xl" fontWeight="bold">
                Menu
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <Stack spacing={3} mt={4}>
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
