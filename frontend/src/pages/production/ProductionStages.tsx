import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Fab,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  CheckCircle,
  Timeline,
  Refresh,
  FilterList,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { productionService } from '../../services/productionService';

interface ProductionStage {
  _id: string;
  name: string;
  description?: string;
  order: number;
  status: string;
  estimatedDuration: number;
  actualDuration?: number;
  startDate?: string;
  endDate?: string;
  assignedTo: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetQuantity: number;
  completedQuantity: number;
  wipQuantity: number;
  progressPercentage: number;
  notes?: string;
}

const ProductionStages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<ProductionStage | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProductionStage | null>(null);
  const [progressData, setProgressData] = useState({
    completedQuantity: 0,
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStages();
  }, [page, statusFilter]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productionService.getProductionStages({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setStages(response.data.data.stages);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to fetch production stages');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      await productionService.deleteProductionStage(stageToDelete._id);
      setStages(stages.filter(stage => stage._id !== stageToDelete._id));
      setDeleteDialogOpen(false);
      setStageToDelete(null);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to delete stage');
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedStage) return;

    try {
      await productionService.updateStageProgress(selectedStage._id, progressData);
      await fetchStages(); // Refresh the list
      setProgressDialogOpen(false);
      setSelectedStage(null);
      setProgressData({ completedQuantity: 0, notes: '' });
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to update progress');
    }
  };

  const openProgressDialog = (stage: ProductionStage) => {
    setSelectedStage(stage);
    setProgressData({
      completedQuantity: stage.completedQuantity,
      notes: stage.notes || '',
    });
    setProgressDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'planned':
        return 'warning';
      case 'on_hold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'in_progress':
        return <PlayArrow />;
      case 'planned':
        return <Timeline />;
      case 'on_hold':
        return <Pause />;
      default:
        return <Timeline />;
    }
  };

  const canEditStage = (stage: ProductionStage) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'supervisor' && stage.supervisor?._id === user.id) return true;
    return false;
  };

  const canUpdateProgress = (stage: ProductionStage) => {
    if (user?.role === 'admin' || user?.role === 'supervisor') return true;
    if (user?.role === 'employee' && stage.assignedTo.some(u => u._id === user.id)) return true;
    return false;
  };

  const filteredStages = stages.filter(stage =>
    stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && stages.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Production Stages
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your production workflow stages
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStages} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/dashboard/production/stages/new')}
            >
              New Stage
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search stages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Chip
                  icon={<Timeline />}
                  label={`${stages.filter(s => s.status === 'planned').length} Planned`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<PlayArrow />}
                  label={`${stages.filter(s => s.status === 'in_progress').length} In Progress`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircle />}
                  label={`${stages.filter(s => s.status === 'completed').length} Completed`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stages Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Stage Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Supervisor</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStages.map((stage) => (
                <TableRow key={stage._id} hover>
                  <TableCell>
                    <Chip
                      label={stage.order}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {stage.name}
                      </Typography>
                      {stage.description && (
                        <Typography variant="caption" color="text.secondary">
                          {stage.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(stage.status)}
                      label={stage.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(stage.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={stage.progressPercentage}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(stage.progressPercentage)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {stage.completedQuantity}/{stage.targetQuantity} units
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {stage.estimatedDuration} min
                    </Typography>
                    {stage.actualDuration && (
                      <Typography variant="caption" color="text.secondary">
                        Actual: {stage.actualDuration} min
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {stage.assignedTo.slice(0, 3).map((user) => (
                        <Tooltip key={user._id} title={`${user.firstName} ${user.lastName}`}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {user.firstName.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                      {stage.assignedTo.length > 3 && (
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
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
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {canUpdateProgress(stage) && (
                        <Tooltip title="Update Progress">
                          <IconButton
                            size="small"
                            onClick={() => openProgressDialog(stage)}
                            color="primary"
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canEditStage(stage) && (
                        <Tooltip title="Edit Stage">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/dashboard/production/stages/${stage._id}/edit`)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user?.role === 'admin' && (
                        <Tooltip title="Delete Stage">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setStageToDelete(stage);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Progress Update Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Stage Progress</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Completed Quantity"
              type="number"
              value={progressData.completedQuantity}
              onChange={(e) => setProgressData({
                ...progressData,
                completedQuantity: parseInt(e.target.value) || 0
              })}
              inputProps={{
                min: 0,
                max: selectedStage?.targetQuantity || 0
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={progressData.notes}
              onChange={(e) => setProgressData({
                ...progressData,
                notes: e.target.value
              })}
            />
            {selectedStage && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Target: {selectedStage.targetQuantity} units
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current: {selectedStage.completedQuantity} units
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained">
            Update Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Production Stage</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the stage "{stageToDelete?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteStage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {(user?.role === 'admin' || user?.role === 'supervisor') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => navigate('/dashboard/production/stages/new')}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default ProductionStages;