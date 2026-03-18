// Leaderboard.tsx - FIXED with undefined checks
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Fade,
  ScaleFade,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Trophy, Award, Medal, TrendingUp, Crown } from "lucide-react";

interface LeaderboardUser {
  username: string;
  value: number;
}

const format = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format;

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("cyan.500", "cyan.300");
  const goldColor = "#FFD700";
  const silverColor = "#C0C0C0";
  const bronzeColor = "#CD7F32";

  const rankColors = [goldColor, silverColor, bronzeColor];

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("/api/user/leaderboard")
      .then((res) => {
        setLeaderboard(res.data.users || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown size={24} color={goldColor} />;
      case 1:
        return <Medal size={24} color={silverColor} />;
      case 2:
        return <Award size={24} color={bronzeColor} />;
      default:
        return (
          <Text fontWeight="bold" fontSize="lg">
            #{index + 1}
          </Text>
        );
    }
  };

  if (isLoading) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="cyan.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box className="leaderboard" minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Icon as={Trophy} boxSize={12} color={accentColor} />
            <Heading
              size="2xl"
              bgGradient={`linear(to-r, ${accentColor}, purple.500)`}
              bgClip="text">
              Leaderboard
            </Heading>
            <Text color="gray.500">Top traders by portfolio value</Text>
          </VStack>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <SimpleGrid columns={3} spacing={4} mt={8}>
              {[1, 0, 2].map((position) => {
                const user = leaderboard[position];
                if (!user) return null;

                return (
                  <ScaleFade in key={position}>
                    <Box
                      bg={bgColor}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="xl"
                      p={6}
                      textAlign="center"
                      transform={position === 0 ? "scale(1.05)" : "scale(1)"}
                      shadow={position === 0 ? "2xl" : "lg"}
                      borderTopWidth={position === 0 ? "4px" : "1px"}
                      borderTopColor={accentColor}>
                      <VStack spacing={3}>
                        <Box position="relative">
                          <Avatar
                            size={position === 0 ? "xl" : "lg"}
                            name={user.username}
                            bg={accentColor}
                          />
                          <Badge
                            position="absolute"
                            bottom={0}
                            right={0}
                            colorScheme="yellow"
                            borderRadius="full"
                            boxSize={6}
                            display="flex"
                            alignItems="center"
                            justifyContent="center">
                            #{position + 1}
                          </Badge>
                        </Box>
                        <Text
                          fontWeight="bold"
                          fontSize={position === 0 ? "xl" : "lg"}>
                          {user.username}
                        </Text>
                        <Stat>
                          <StatLabel color="gray.500">Portfolio</StatLabel>
                          <StatNumber
                            fontSize={position === 0 ? "2xl" : "xl"}
                            color={accentColor}>
                            {format(user.value)}
                          </StatNumber>
                        </Stat>
                      </VStack>
                    </Box>
                  </ScaleFade>
                );
              })}
            </SimpleGrid>
          )}

          {/* Full Leaderboard Table */}
          <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            shadow="lg"
            overflow="hidden"
            mt={8}>
            <VStack
              spacing={0}
              align="stretch"
              divider={
                <Box borderBottomWidth="1px" borderColor={borderColor} />
              }>
              {leaderboard.map((user, index) => (
                <Fade in key={user.username || index}>
                  <HStack
                    p={4}
                    justify="space-between"
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                    transition="all 0.2s">
                    <HStack spacing={4}>
                      <Box w="40px" textAlign="center">
                        {getRankIcon(index)}
                      </Box>
                      <Avatar
                        size="sm"
                        name={user.username}
                        bg={index < 3 ? rankColors[index] : accentColor}
                      />
                      <Text fontWeight="medium">{user.username}</Text>
                    </HStack>
                    <HStack spacing={4}>
                      <Stat textAlign="right">
                        <StatNumber
                          fontSize="md"
                          color={index < 3 ? rankColors[index] : accentColor}>
                          {format(user.value)}
                        </StatNumber>
                      </Stat>
                      {index < 3 && (
                        <Icon as={TrendingUp} color={rankColors[index]} />
                      )}
                    </HStack>
                  </HStack>
                </Fade>
              ))}
            </VStack>
          </Box>

          {/* Empty State */}
          {leaderboard.length === 0 && !isLoading && (
            <Center py={10}>
              <Text color="gray.500">No leaderboard data available</Text>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default Leaderboard;
