import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Card,
    CardContent,
    Button,
    Grid,
    Box,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create QAest theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  module: string;
  appType: string;
  osType: string;
  createdBy: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

const App: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
  });

  // Fetch demo data from backend
  useEffect(() => {
    fetchDemoData();
  }, []);

  const fetchDemoData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/demo');
      const data = await response.json();
      
      if (data.success) {
        setTestCases(data.data.testCases);
        setCurrentUser(data.data.currentUser);
      } else {
        setError('Failed to load demo data');
      }
    } catch (err) {
      setError('Backend server not available. Make sure it\'s running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test-cases/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTestCase),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestCases([...testCases, data.data.testCase]);
        setCreateDialogOpen(false);
        setNewTestCase({ title: '', description: '', priority: 'medium', category: '' });
      }
    } catch (err) {
      setError('Failed to create test case');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'blocked': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading QAest...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🚀 QAest - Test Case Management
            </Typography>
            {currentUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">
                  Welcome, {currentUser.username}
                </Typography>
                <Chip 
                  label={currentUser.role.replace('_', ' ').toUpperCase()} 
                  color="secondary" 
                  size="small" 
                />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              <Button onClick={fetchDemoData} sx={{ ml: 2 }}>
                Retry
              </Button>
            </Alert>
          )}

          {/* Dashboard Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Test Case Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Manage and track your test cases efficiently
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Test Case
              </Button>
              <Button variant="outlined" onClick={fetchDemoData}>
                Refresh Data
              </Button>
            </Box>
          </Box>

          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Test Cases
                  </Typography>
                  <Typography variant="h4">
                    {testCases.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Cases
                  </Typography>
                  <Typography variant="h4">
                    {testCases.filter(tc => tc.status === 'active').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    High Priority
                  </Typography>
                  <Typography variant="h4">
                    {testCases.filter(tc => tc.priority === 'high').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Your Role
                  </Typography>
                  <Typography variant="h6">
                    {currentUser?.role.replace('_', ' ').toUpperCase()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Test Cases List */}
          <Typography variant="h5" gutterBottom>
            Test Cases
          </Typography>
          
          <Grid container spacing={3}>
            {testCases.map((testCase) => (
              <Grid item xs={12} md={6} lg={4} key={testCase.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div" noWrap>
                        {testCase.title}
                      </Typography>
                      <Chip 
                        label={testCase.id} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {testCase.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={testCase.priority} 
                        color={getPriorityColor(testCase.priority) as any}
                        size="small" 
                      />
                      <Chip 
                        label={testCase.status} 
                        color={getStatusColor(testCase.status) as any}
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="caption" display="block" gutterBottom>
                      Category: {testCase.category}
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      Module: {testCase.module}
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      App Type: {testCase.appType} | OS: {testCase.osType}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Created by: {testCase.createdBy}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {testCases.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No test cases found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first test case to get started
              </Typography>
            </Box>
          )}
        </Container>

        {/* Create Test Case Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Test Case</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={newTestCase.title}
              onChange={(e) => setNewTestCase({ ...newTestCase, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newTestCase.description}
              onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Category"
              fullWidth
              variant="outlined"
              value={newTestCase.category}
              onChange={(e) => setNewTestCase({ ...newTestCase, category: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTestCase} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App; 