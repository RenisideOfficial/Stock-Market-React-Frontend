// AccountMenu.tsx
import React, { useState, useEffect } from "react";
import tokens from "../services/tokens.service";
import { ChevronDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

function AccountMenu() {
  const location = useLocation();
  const [username, setUsername] = useState(tokens.getUsername());

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    setUsername(tokens.getUsername());
  }, [location.pathname]);

  const handleLogout = () => {
    tokens.clearToken();
    setUsername("");
    window.location.reload();
  };

  return (
    <>
      {username ? (
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            rounded="full"
            px={2}
            _hover={{ bg: hoverBg }}
            rightIcon={<ChevronDownIcon size={18} />}>
            <HStack spacing={2}>
              <Avatar size="sm" name={username} bg="cyan.500" />
              <Text
                display={{ base: "none", md: "inline" }}
                fontWeight="medium">
                {username}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList
            bg={bgColor}
            borderColor={borderColor}
            shadow="lg"
            minW="180px">
            <MenuItem
              icon={<LogOutIcon size={16} />}
              onClick={handleLogout}
              _hover={{ bg: hoverBg }}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Button
          as={Link}
          to="/login"
          variant="solid"
          colorScheme="cyan"
          rounded="full"
          size="md"
          px={6}
          _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
          transition="all 0.2s">
          Sign In
        </Button>
      )}
    </>
  );
}

export default AccountMenu;
