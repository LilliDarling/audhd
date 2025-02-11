import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  const quotes = [
    { text: "Why fit in when you were born to stand out.", author: "Dr.Seuss" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "You don't have to do everything today. Do what you can, with what you have, where you are.", author: "Anonymous" },
    { text: "You're not behind, you're on your own timeline.", author: "Anonymous" },
    { text: "I dwell in possibility", author: "Emily Dickinson" },
    { text: "Don't watch the clock, do what it does. Keep going.", author: "Sam Levenson"}
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote.text);
    setAuthor(randomQuote.author);
  }, []);

  return (
    <View className="flex-1 bg-slate-800 p-6 justify-center space-y-12">
      <View className="space-y-3 items-center">
        <Text className="text-3xl font-bold text-slate-200">Welcome to Effie</Text>
        <Text className="text-lg text-slate-400">
          Your personal task management assistant
        </Text>
      </View>

      <View className="bg-gray-200 p-6 rounded-lg space-y-3">
        <Text className="text-lg italic text-slate-800">"{quote}"</Text>
        <Text className="text-slate-700">— {author}</Text>
      </View>

      <View className="flex items-center">
        <Link href="./tasks" asChild>
          <Pressable className="bg-sky-600 py-2 px-2 rounded-lg active:opacity-80 w-1/3">
            <Text className="text-slate-200 text-center text-lg font-semibold">
              View My Tasks →
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}