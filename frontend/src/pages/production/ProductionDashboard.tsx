import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Engineering,
  Assignment,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Add,
  Refresh,
  Timeline,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { productionService } from '../../services/productionService';

interface DashboardData {
  stageStats: Array<{
    _id: string;
    count: number;
    totalTarget: number;
    totalCompleted: number;
  }>;
  workOrderStats: Array<{
    _id: string;
    count: number;
    totalTarget: number;
    totalCompleted: number;
  }>;
  activeStages: Array<{
    _id: string;
    name: string;
    status: string;
    completedQuantity: number;
    targetQuantity: number;
    assignedTo: Array<{ firstName: string; lastName: string }>;
    supervisor: { firstName: string; lastName: string };
  }>;
  recentWorkOrders: Array<{
    _id: string;
    orderNumber: string;
    productName: string;
    status: string;
    priority: string;
    progressPercentage: number;
    dueDate: string;
  }>;
  efficiency: number;
  summary: {
    totalStages: number;
    completedStages: number;
    inProgressStages: number;
    totalWorkOrders: number;
    activeWorkOrders: number;
  };
}

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await productionService.getDashboardData();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#2196f3';
      case 'planned':
        return '#ff9800';
      case 'on_hold':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <PlayArrow color="primary" />;
      case 'planned':
        return <Timeline color="warning" />;
      case 'on_hold':
        return <Pause color="error" />;
      default:
        return <Stop color="disabled" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Failed to load dashboard data
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const dashboardCards = [
    {
      id: 'efficiency',
      title: 'Production Efficiency',
      value: `${dashboardData.efficiency}%`,
      subtitle: 'Overall completion rate',
      icon: <TrendingUp />,
      color: '#4caf50',
      progress: dashboardData.efficiency,
    },
    {
      id: 'stages',
      title: 'Active Stages',
      value: dashboardData.summary.inProgressStages.toString(),
      subtitle: `${dashboardData.summary.totalStages} total stages`,
      icon: <Engineering />,
      color: '#2196f3',
      progress: dashboardData.summary.totalStages > 0 
        ? (dashboardData.summary.inProgressStages / dashboardData.summary.totalStages) * 100 
        : 0,
    },
    {
      id: 'workorders',
      title: 'Active Work Orders',
      value: dashboardData.summary.activeWorkOrders.toString(),
      subtitle: `${dashboardData.summary.totalWorkOrders} total orders`,
      icon: <Assignment />,
      color: '#ff9800',
      progress: dashboardData.summary.totalWorkOrders > 0 
        ? (dashboardData.summary.activeWorkOrders / dashboardData.summary.totalWorkOrders) * 100 
        : 0,
    },
    {
      id: 'completed',
      title: 'Completed Stages',
      value: dashboardData.summary.completedStages.toString(),
      subtitle: 'This period',
      icon: <CheckCircle />,
      color: '#9c27b0',
      progress: dashboardData.summary.totalStages > 0 
        ? (dashboardData.summary.completedStages / dashboardData.summary.totalStages) * 100 
        : 0,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Slide direction="down" in={animate} timeout={600}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Production Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Monitor and manage your production processes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchDashboardData} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/dashboard/production/stages/new')}
                  >
                    New Stage
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/dashboard/production/work-orders/new')}
                  >
                    New Work Order
                  </Button>
                </>
              )}
            </Box>
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
                        {Math.round(card.progress)}% complete
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Active Stages */}
          <Grid item xs={12} lg={8}>
            <Fade in={animate} timeout={1000}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      Active Production Stages
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => navigate('/dashboard/production/stages')}
                      endIcon={<Speed />}
                    >
                      View All
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Stage Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Assigned To</TableCell>
                          <TableCell>Supervisor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.activeStages.map((stage) => (
                          <TableRow key={stage._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {stage.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(stage.status)}
                                label={stage.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: `${getStatusColor(stage.status)}20`,
                                  color: getStatusColor(stage.status),
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(stage.completedQuantity / stage.targetQuantity) * 100}
                                  sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {stage.completedQuantity}/{stage.targetQuantity}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {stage.assignedTo.slice(0, 3).map((user, index) => (
                                  <Tooltip key={index} title={`${user.firstName} ${user.lastName}`}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                      {user.firstName.charAt(0)}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                                {stage.assignedTo.length > 3 && (
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    +{stage.assignedTo.length - 3}
                                  </Avatar>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {stage.supervisor && (
                                <Typography variant="body2">
                                  {stage.supervisor.firstName} {stage.supervisor.lastName}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Recent Work Orders */}
          <Grid item xs={12} lg={4}>
            <Fade in={animate} timeout={1200}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      Recent Work Orders
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => navigate('/dashboard/production/work-orders')}
                      endIcon={<Assignment />}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {dashboardData.recentWorkOrders.map((order) => (
                      <Box
                        key={order._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 2,
                          borderBottom: '1px solid rgba(0,0,0,0.1)',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.productName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip
                              label={order.priority.toUpperCase()}
                              size="small"
                              color={getPriorityColor(order.priority) as any}
                              variant="outlined"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={order.progressPercentage}
                              sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(order.progressPercentage)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductionDashboard;