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
    <View>
      <View>
        <Text>Welcome to Effie.</Text>
        <Text>
          Your personal task management assistant
        </Text>
      </View>

      <View>
        <Text>"{quote}"</Text>
        <Text>— {author}</Text>
      </View>

      <Link href="./tasks" asChild>
        <Pressable>
          <Text>
            View My Tasks →
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}