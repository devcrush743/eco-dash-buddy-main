import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  createDriver,
  listenToDrivers,
  updateDriver,
  deleteDriver,
  toggleDriverStatus,
  generateDriverId,
  getDriverStats,
  type Driver,
  DEFAULT_DRIVER_PASSWORD
} from '@/utils/driverHelpers';
import {
  Shield,
  Plus,
  Users,
  UserCheck,
  UserX,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Truck,
  Activity,
  Calendar,
  TrendingUp
} from 'lucide-react';
import GoToNewDashboardButton from '@/components/GoToNewDashboardButton';
import { TestDataSetup } from './TestDataSetup';
import { DelhiTestDataSetup } from './DelhiTestDataSetup';

interface AdminDashboardProps {
  onLogout: () => void;
  className?: string;
}

export const AdminDashboard = ({ onLogout, className }: AdminDashboardProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    createdToday: 0
  });

  // Add Driver Form State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDriver, setNewDriver] = useState({
    driverId: '',
    name: '',
    password: DEFAULT_DRIVER_PASSWORD
  });

  // Edit Driver Form State
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    password: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Listen to drivers in real-time
  useEffect(() => {
    const unsubscribe = listenToDrivers((driversData) => {
      setDrivers(driversData);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update stats when drivers change
  useEffect(() => {
    const updateStats = async () => {
      const newStats = await getDriverStats();
      setStats(newStats);
    };

    if (drivers.length > 0) {
      updateStats();
    }
  }, [drivers]);

  // Generate next driver ID when add dialog opens
  useEffect(() => {
    if (showAddDialog && !newDriver.driverId) {
      generateDriverId().then(id => {
        setNewDriver(prev => ({ ...prev, driverId: id }));
      });
    }
  }, [showAddDialog, newDriver.driverId]);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDriver.driverId.trim() || !newDriver.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Driver ID and Name are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      await createDriver({
        driverId: newDriver.driverId,
        name: newDriver.name,
        password: newDriver.password
      });

      toast({
        title: "Driver Created",
        description: `Driver ${newDriver.driverId} has been created successfully`,
      });

      // Reset form
      setNewDriver({
        driverId: '',
        name: '',
        password: DEFAULT_DRIVER_PASSWORD
      });
      setShowAddDialog(false);

    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create driver",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setEditForm({
      name: driver.name,
      password: driver.password,
      status: driver.status
    });
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDriver || !editForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      await updateDriver(editingDriver.id, {
        name: editForm.name,
        password: editForm.password,
        status: editForm.status
      });

      toast({
        title: "Driver Updated",
        description: `Driver ${editingDriver.driverId} has been updated successfully`,
      });

      setEditingDriver(null);

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update driver",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      await toggleDriverStatus(driver.id);
      toast({
        title: "Status Updated",
        description: `Driver ${driver.driverId} is now ${driver.status === 'active' ? 'inactive' : 'active'}`,
      });
    } catch (error: any) {
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update driver status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete driver ${driver.driverId} (${driver.name})?`)) {
      return;
    }

    try {
      await deleteDriver(driver.id);
      toast({
        title: "Driver Deleted",
        description: `Driver ${driver.driverId} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete driver",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (driverId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    return <Badge variant="destructive">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 text-sm">Swachh Saarthi Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GoToNewDashboardButton role="admin" />
              <Button
                onClick={onLogout}
                variant="outline"
                className="gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Drivers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Drivers</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <UserCheck className="h-10 w-10 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Inactive Drivers</p>
                <p className="text-3xl font-bold">{stats.inactive}</p>
              </div>
              <UserX className="h-10 w-10 text-orange-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Created Today</p>
                <p className="text-3xl font-bold">{stats.createdToday}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Route Optimization Test Data Setup */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <TestDataSetup />
          </div>
          
          <div className="flex justify-center">
            <DelhiTestDataSetup />
          </div>
        </div>

        {/* Driver Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-slate-900">Driver Management</h2>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Driver</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDriver} className="space-y-4">
                  <div>
                    <Label htmlFor="driverId">Driver ID</Label>
                    <Input
                      id="driverId"
                      value={newDriver.driverId}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, driverId: e.target.value.toUpperCase() }))}
                      placeholder="DRV001"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter driver name"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      value={newDriver.password}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Default: driver123"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      disabled={isCreating}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Driver'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Drivers Table */}
          {drivers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Drivers Found</h3>
              <p className="text-slate-600 mb-4">Get started by creating your first driver account</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Driver
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Driver ID</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Password</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">On Duty</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Last Check-In</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-primary">
                        {driver.driverId}
                      </td>
                      <td className="py-3 px-4">
                        {driver.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showPasswords[driver.id] ? driver.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(driver.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords[driver.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(driver.status)}
                      </td>
                      <td className="py-3 px-4">
                        {driver.onDuty ? (
                          <Badge className="bg-emerald-500 text-white">On Duty</Badge>
                        ) : (
                          <Badge variant="secondary">Off Duty</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.lastCheckInAt ? (
                          driver.lastCheckInAt.toDate ?
                            driver.lastCheckInAt.toDate().toLocaleString() :
                            new Date(driver.lastCheckInAt).toLocaleString()
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.createdAt ? (
                          driver.createdAt.toDate ? 
                            driver.createdAt.toDate().toLocaleDateString() :
                            new Date(driver.createdAt).toLocaleDateString()
                        ) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDriver(driver)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(driver)}
                            className={`h-8 w-8 p-0 ${
                              driver.status === 'active' 
                                ? 'hover:bg-orange-50 hover:border-orange-300' 
                                : 'hover:bg-green-50 hover:border-green-300'
                            }`}
                          >
                            {driver.status === 'active' ? (
                              <UserX className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDriver(driver)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Driver Dialog */}
      <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Driver: {editingDriver?.driverId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDriver} className="space-y-4">
            <div>
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label htmlFor="editPassword">Password</Label>
              <Input
                id="editPassword"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <select
                id="editStatus"
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                disabled={isUpdating}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDriver(null)}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Driver'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
