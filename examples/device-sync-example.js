/**
 * Example usage of Garmin Connect Device Sync functionality
 *
 * This example shows how to:
 * 1. Get connected devices
 * 2. Create a workout
 * 3. Push the workout to devices
 * 4. Monitor sync status
 */

const { GarminConnect } = require('../dist/index');

async function deviceSyncExample() {
    // Initialize Garmin Connect client
    const GCClient = new GarminConnect({
        username: 'klarsen1997@gmail.com',
        password: '2990aWd!'
    });

    try {
        // Login to Garmin Connect
        console.log('🔐 Logging in to Garmin Connect...');
        await GCClient.login();
        console.log('✅ Successfully logged in');

        // Get all connected devices
        console.log('📱 Getting connected devices...');
        const allDevices = await GCClient.getDevices();
        console.log(`Found ${allDevices.length} connected devices:`);

        allDevices.forEach((device) => {
            console.log(`  - ${device.displayName} (ID: ${device.deviceId})`);
            console.log(
                `    Type: ${
                    device.productDisplayName || device.deviceTypeSimpleName
                }`
            );
            console.log(
                `    Workout Capable: ${device.workoutCapable ? 'Yes' : 'No'}`
            );
            if (device.workoutCapable) {
                const workoutTypes = [];
                if (device.runningWorkoutCapable) workoutTypes.push('Running');
                if (device.cyclingWorkoutCapable) workoutTypes.push('Cycling');
                if (device.strengthWorkoutCapable)
                    workoutTypes.push('Strength');
                if (device.swimWorkoutCapable) workoutTypes.push('Swimming');
                console.log(`    Workout Types: ${workoutTypes.join(', ')}`);
                console.log(`    Max Workouts: ${device.maxWorkoutCount}`);
            }
        });

        // Get workout-capable devices only
        console.log('\n🏃 Getting workout-capable devices...');
        const workoutDevices = await GCClient.getWorkoutDevices();
        console.log(`Found ${workoutDevices.length} workout-capable devices:`);

        workoutDevices.forEach((device) => {
            console.log(`  - ${device.displayName} (ID: ${device.deviceId})`);
        });

        if (workoutDevices.length === 0) {
            console.log(
                '❌ No workout-capable devices found. Cannot sync workouts.'
            );
            return;
        }

        // Create a sample running workout
        console.log('\n💪 Creating a running workout...');
        const workout = await GCClient.addRunningWorkout(
            'Morning 5K Run',
            5000,
            'Easy pace morning run for fitness'
        );
        console.log(
            `✅ Created workout: ${workout.workoutName} (ID: ${workout.workoutId})`
        );

        // Push workout to the first workout-capable device
        const targetDevice = workoutDevices[0];
        console.log(
            `\n📤 Pushing workout to device: ${targetDevice.displayName}`
        );

        const syncResult = await GCClient.pushWorkoutToDevice(
            { workoutId: workout.workoutId.toString() },
            targetDevice.deviceId,
            workout.workoutName
        );

        console.log('✅ Workout successfully queued for sync');
        console.log('Sync result:', syncResult);

        // Alternative: Push to all workout-capable devices
        console.log('\n📤 Pushing workout to ALL workout-capable devices...');
        const allSyncResults = await GCClient.pushWorkoutToAllDevices(
            { workoutId: workout.workoutId.toString() },
            workout.workoutName
        );

        console.log(`✅ Workout pushed to ${allSyncResults.length} devices`);

        // Check device messages/sync status
        console.log('\n📊 Checking device sync status...');
        const messages = await GCClient.getDeviceMessages();
        console.log(`Found ${messages.length} device messages:`);

        messages.forEach((message) => {
            console.log(`  - Device: ${message.deviceId}`);
            console.log(`    Type: ${message.messageType}`);
            console.log(
                `    Status: ${message.delivered ? 'Delivered' : 'Pending'}`
            );
        });

        console.log('\n🎉 Device sync example completed successfully!');
    } catch (error) {
        console.error('❌ Error in device sync example:', error);
    }
}

// Example workflow for automated workout distribution
async function automatedWorkoutDistribution() {
    const GCClient = new GarminConnect({
        username: 'your_username',
        password: 'your_password'
    });

    await GCClient.login();

    // Get devices that support running workouts
    const devices = await GCClient.getWorkoutDevices();
    const runningDevices = devices.filter(
        (device) =>
            device.capabilities?.workoutFeatures?.includes('running') ||
            device.capabilities?.workoutFeatures?.includes('cardio')
    );

    console.log(
        `Found ${runningDevices.length} devices capable of running workouts`
    );

    // Create multiple workouts for the week
    const weeklyWorkouts = [
        {
            name: 'Monday Easy Run',
            distance: 5000,
            description: 'Easy 5K to start the week'
        },
        {
            name: 'Wednesday Tempo Run',
            distance: 8000,
            description: 'Tempo pace for 8K'
        },
        {
            name: 'Friday Long Run',
            distance: 15000,
            description: 'Long run for endurance'
        }
    ];

    for (const workoutPlan of weeklyWorkouts) {
        console.log(`\n📝 Creating workout: ${workoutPlan.name}`);

        const workout = await GCClient.addRunningWorkout(
            workoutPlan.name,
            workoutPlan.distance,
            workoutPlan.description
        );

        // Push to all running-capable devices
        await GCClient.pushWorkoutToAllDevices(
            { workoutId: workout.workoutId.toString() },
            workout.workoutName
        );

        console.log(`✅ ${workoutPlan.name} synced to all devices`);
    }

    console.log('\n🎯 Weekly workout distribution completed!');
}

// Export functions for use
module.exports = {
    deviceSyncExample,
    automatedWorkoutDistribution
};

// Run example if this file is executed directly
if (require.main === module) {
    deviceSyncExample().catch(console.error);
}
