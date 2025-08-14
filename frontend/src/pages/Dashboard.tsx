import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Grow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  Inventory,
  Engineering,
  Assessment,
  Settings,
  Notifications,
  Person,
  Business,
  Speed,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';

const MainDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const dashboardCards = [
    {
      id: 'production',
      title: 'Production Efficiency',
      value: '87%',
      subtitle: 'Last 30 days',
      icon: <TrendingUp />,
      color: '#4caf50',
      progress: 87,
      status: 'success',
    },
    {
      id: 'inventory',
      title: 'Inventory Status',
      value: '1,234',
      subtitle: 'Active items',
      icon: <Inventory />,
      color: '#2196f3',
      progress: 65,
      status: 'warning',
    },
    {
      id: 'maintenance',
      title: 'Equipment Health',
      value: '92%',
      subtitle: 'Operational',
      icon: <Engineering />,
      color: '#ff9800',
      progress: 92,
      status: 'success',
    },
    {
      id: 'quality',
      title: 'Quality Score',
      value: '98.5%',
      subtitle: 'Defect rate',
      icon: <Assessment />,
      color: '#9c27b0',
      progress: 98.5,
      status: 'success',
    },
  ];

  const quickActions = [
    { title: 'Start Production', icon: <Speed />, color: '#4caf50' },
    { title: 'Check Inventory', icon: <Inventory />, color: '#2196f3' },
    { title: 'Schedule Maintenance', icon: <Engineering />, color: '#ff9800' },
    { title: 'Generate Report', icon: <Assessment />, color: '#9c27b0' },
  ];

  const recentActivities = [
    { action: 'Production line A started', time: '2 minutes ago', status: 'success' },
    { action: 'Quality check completed', time: '15 minutes ago', status: 'success' },
    { action: 'Maintenance scheduled', time: '1 hour ago', status: 'warning' },
    { action: 'Inventory updated', time: '2 hours ago', status: 'success' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Slide direction="down" in={animate} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome back, {user?.firstName || 'User'}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Here's what's happening in your factory today
            </Typography>
          </Box>
        </Slide>

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.id}>
              <Grow in={animate} timeout={800 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: card.color,
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {card.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.subtitle}
                    </Typography>
                    {card.progress && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={card.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: card.color,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {card.progress}% complete
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Fade in={animate} timeout={1000}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {quickActions.map((action, index) => (
                      <Grid item xs={6} key={index}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={action.icon}
                          sx={{
                            py: 2,
                            borderRadius: 2,
                            borderColor: action.color,
                            color: action.color,
                            '&:hover': {
                              bgcolor: action.color,
                              color: 'white',
                            },
                          }}
                        >
                          {action.title}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Fade in={animate} timeout={1200}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Recent Activities
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {recentActivities.map((activity, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          borderBottom: index < recentActivities.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          {getStatusIcon(activity.status)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* User Info Card */}
        <Slide direction="up" in={animate} timeout={1400}>
          <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user?.firstName} {user?.lastName}
        </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.role} • {user?.companyName}
        </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Notifications">
                    <IconButton>
                      <Notifications />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Settings">
                    <IconButton>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
};

const Dashboard: React.FC = () => {
  return <MainDashboard />;
};

export default Dashboard; 