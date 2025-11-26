# Device Sync Feature Documentation

## Overview

The Garmin Connect library now includes device synchronization capabilities, allowing you to automatically push workouts to connected Garmin devices. This feature completes the workout management ecosystem by enabling seamless delivery of workouts to watches and cycling computers.

## New Methods

### Device Discovery

#### `getDevices(): Promise<IDevice[]>`

Get all connected devices registered to your Garmin Connect account.

```javascript
const devices = await GCClient.getDevices();
console.log(`Found ${devices.length} connected devices`);

devices.forEach((device) => {
    console.log(`- ${device.displayName} (${device.deviceTypeDisplayName})`);
    console.log(
        `  Capabilities: ${device.capabilities?.workoutFeatures?.join(', ')}`
    );
});
```

#### `getWorkoutDevices(): Promise<IDevice[]>`

Get only devices that support workout synchronization.

```javascript
const workoutDevices = await GCClient.getWorkoutDevices();
console.log(`Found ${workoutDevices.length} workout-capable devices`);
```

### Workout Synchronization

#### `pushWorkoutToDevice(workout, deviceId, workoutName?): Promise<any>`

Push a specific workout to a single device.

```javascript
// Create a workout first
const workout = await GCClient.addRunningWorkout(
    'Morning 5K',
    5000,
    'Easy pace morning run'
);

// Push to specific device
const result = await GCClient.pushWorkoutToDevice(
    { workoutId: workout.workoutId.toString() },
    '3484806162', // Device ID
    'Morning 5K Run'
);

console.log('Workout synced:', result);
```

#### `pushWorkoutToAllDevices(workout, workoutName?): Promise<any[]>`

Push a workout to all workout-capable devices.

```javascript
const results = await GCClient.pushWorkoutToAllDevices(
    { workoutId: workout.workoutId.toString() },
    'Morning 5K Run'
);

console.log(`Workout synced to ${results.length} devices`);
```

### Sync Status Monitoring

#### `getDeviceMessages(deviceId?): Promise<IDeviceMessage[]>`

Check the status of device sync messages.

```javascript
// Get all messages
const allMessages = await GCClient.getDeviceMessages();

// Get messages for specific device
const deviceMessages = await GCClient.getDeviceMessages('3484806162');

messages.forEach((message) => {
    console.log(`Device: ${message.deviceId}`);
    console.log(`Status: ${message.delivered ? 'Delivered' : 'Pending'}`);
});
```

## Complete Workflow Example

```javascript
import { GarminConnect } from 'garmin-connect';

async function workoutSyncWorkflow() {
    const GCClient = new GarminConnect({
        username: 'your_username',
        password: 'your_password'
    });

    // 1. Login
    await GCClient.login();

    // 2. Get workout-capable devices
    const devices = await GCClient.getWorkoutDevices();
    console.log(`Found ${devices.length} workout-capable devices`);

    if (devices.length === 0) {
        console.log('No workout-capable devices found');
        return;
    }

    // 3. Create a workout
    const workout = await GCClient.addRunningWorkout(
        'Interval Training',
        8000,
        'Speed work: 8x400m intervals'
    );

    // 4. Push to all devices
    const syncResults = await GCClient.pushWorkoutToAllDevices(
        { workoutId: workout.workoutId.toString() },
        workout.workoutName
    );

    console.log(
        `✅ Workout "${workout.workoutName}" synced to ${syncResults.length} devices`
    );

    // 5. Monitor sync status
    setTimeout(async () => {
        const messages = await GCClient.getDeviceMessages();
        const recentMessages = messages.filter(
            (m) => m.data?.workoutId === workout.workoutId.toString()
        );

        console.log(`Sync status: ${recentMessages.length} messages found`);
    }, 5000);
}
```

## Device Types and Capabilities

The implementation automatically filters devices based on their workout capabilities:

### Supported Device Types

-   **Forerunner Series** (running, cycling, swimming)
-   **Fenix Series** (running, cycling, swimming, strength)
-   **Edge Series** (cycling-focused)
-   **Descent Series** (diving, fitness)
-   **Venu Series** (running, cycling, strength, yoga)

### Capability Detection

Devices are filtered based on their `capabilities.workoutFeatures` array:

-   `running` - Supports running workouts
-   `cycling` - Supports cycling workouts
-   `swimming` - Supports swimming workouts
-   `strength` - Supports strength training
-   `cardio` - Supports cardio workouts

## API Endpoints Used

The implementation uses these Garmin Connect API endpoints:

```
GET  /device-service/deviceregistration/devices
POST /device-service/devicemessage/messages
```

## Error Handling

All methods include comprehensive error handling:

```javascript
try {
    const devices = await GCClient.getDevices();
    // ... use devices
} catch (error) {
    console.error('Device sync error:', error.message);
    // Handle error appropriately
}
```

## Limitations and Notes

1. **Device Connection**: Devices must be registered and connected to your Garmin Connect account
2. **Workout Format**: Only FIT format workouts are supported (automatically handled)
3. **Sync Timing**: Actual sync to device depends on device connectivity (WiFi/Bluetooth)
4. **Rate Limiting**: Be mindful of API rate limits when syncing to multiple devices

## Testing

Use the provided test files to verify functionality:

```bash
# Run the test suite
node examples/test-device-sync.js

# Run the full example
node examples/device-sync-example.js
```

## Benefits

### For Users

-   ✅ Seamless workout delivery to watches
-   ✅ No manual sync required
-   ✅ Support for multiple devices
-   ✅ Automated training plan distribution

### For Developers

-   ✅ Complete workout management ecosystem
-   ✅ Simple, intuitive API
-   ✅ Comprehensive error handling
-   ✅ TypeScript support with full type definitions

## Next Steps

This implementation provides the foundation for advanced features like:

-   Scheduled workout delivery
-   Training plan automation
-   Device-specific workout optimization
-   Bulk workout management

The device sync feature makes the garmin-connect library a comprehensive solution for Garmin Connect integration!
