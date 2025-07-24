import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const ModernStatCard = ({ title, value, subtitle, icon, gradientColors = ['#3B82F6', '#60A5FA'] }) => {
  const theme = useTheme();

  return (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      sx={{
        height: '100%',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 20px ${alpha(gradientColors[0], 0.4)}`,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

export default ModernStatCard;