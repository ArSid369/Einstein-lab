import {
  Assessment,
  AssessmentResult,
  CodingTask,
  Cohort,
  Domain,
  LessonContent,
  Module,
  NotificationItem,
  ProgressRecord,
  SavedReport,
  User,
} from '../types/newtonlab';

export const SAMPLE_USERS: Record<'sme' | 'associate_returning' | 'associate_new', User> = {
  sme: {
    id: 'user-sme-1',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@newtonlab.io',
    role: 'SME',
    organization: 'NewtonLab Robotics Curriculum Division',
    title: 'Principal Robotics Curriculum Architect',
    avatarUrl: '/src/assets/images/avatar_sme_elena_1794547716616.jpg',
    isFirstTimeAssociate: false,
    timezone: 'America/Los_Angeles',
    preferences: {
      emailNotifications: true,
      assessmentReminders: true,
      aiSuggestions: true,
      compactDensity: false,
      highContrastCode: true,
      reducedMotion: false,
    },
  },
  associate_returning: {
    id: 'user-assoc-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@newtonlab.io',
    role: 'ASSOCIATE',
    organization: 'Apex Autonomous Systems — Cohort Alpha',
    title: 'Junior Robotics Software Engineer',
    avatarUrl: '/src/assets/images/avatar_associate_marcus_1794547717661.jpg',
    cohortId: 'cohort-alpha',
    isFirstTimeAssociate: false,
    timezone: 'America/Los_Angeles',
    preferences: {
      emailNotifications: true,
      assessmentReminders: true,
      aiSuggestions: true,
      compactDensity: false,
      highContrastCode: true,
      reducedMotion: false,
    },
  },
  associate_new: {
    id: 'user-assoc-2',
    name: 'Maya Patel',
    email: 'maya.patel@newtonlab.io',
    role: 'ASSOCIATE',
    organization: 'Apex Autonomous Systems — Cohort Beta',
    title: 'Graduate Robotics Trainee',
    avatarUrl: '/src/assets/images/avatar_associate_marcus_1794547717661.jpg',
    cohortId: 'cohort-beta',
    isFirstTimeAssociate: true,
    timezone: 'America/New_York',
    preferences: {
      emailNotifications: true,
      assessmentReminders: true,
      aiSuggestions: true,
      compactDensity: false,
      highContrastCode: true,
      reducedMotion: false,
    },
  },
};

export const INITIAL_COHORTS: Cohort[] = [
  { id: 'cohort-alpha', name: 'Cohort Alpha — Autumn 2026', startDate: '2026-09-15', learnerCount: 28, leadSme: 'Dr. Elena Vance' },
  { id: 'cohort-beta', name: 'Cohort Beta — Winter 2026', startDate: '2026-11-01', learnerCount: 18, leadSme: 'Dr. Elena Vance' },
];

export const INITIAL_DOMAINS: Domain[] = [
  {
    id: 'dom-python',
    name: 'Python Fundamentals',
    slug: 'python-fundamentals',
    iconKey: 'python',
    accentColor: '#53b947',
    shortDescription: 'Core Python syntax, control flow, functions, and object-oriented telemetry structures for robotics.',
    detailedOverview:
      'Build rock-solid engineering fluency in Python 3. Covers structured sensor data containers, deterministic state machines, and clean modular code patterns used across autonomous robotics stacks.',
    learningObjectives: [
      'Write clean, type-hinted Python functions for robot command pipelines',
      'Model pose vectors, sensor readings, and obstacle bounds with classes and dataclasses',
      'Debug edge cases such as division-by-zero and boundary saturation',
    ],
    prerequisites: ['Basic programming familiarity'],
    difficultyRange: 'Beginner',
    estimatedHours: 8,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-08',
    contentCoverage: 100,
    assessmentReadiness: 100,
  },
  {
    id: 'dom-numpy',
    name: 'NumPy',
    slug: 'numpy',
    iconKey: 'numpy',
    accentColor: '#0284C7',
    shortDescription: 'Vectorized linear algebra, rotation matrices, and high-speed point-cloud array operations.',
    detailedOverview:
      'Master N-dimensional arrays, broadcasting, dot products, and homogeneous transformation matrices so robot kinematics and LiDAR scans compute in milliseconds.',
    learningObjectives: [
      'Construct 2D and 3D rotation matrices using NumPy arrays',
      'Compute Euclidean norms and waypoint distances without slow Python loops',
      'Transform coordinates between robot body frame and world frame',
    ],
    prerequisites: ['Python Fundamentals'],
    difficultyRange: 'Beginner – Intermediate',
    estimatedHours: 10,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-09',
    contentCoverage: 95,
    assessmentReadiness: 100,
  },
  {
    id: 'dom-pandas',
    name: 'Pandas',
    slug: 'pandas',
    iconKey: 'pandas',
    accentColor: '#0D9488',
    shortDescription: 'Time-series telemetry cleaning, IMU drift filtering, and rosbag log analysis.',
    detailedOverview:
      'Analyze multi-sensor logs exported from autonomous runs. Clean missing timestamps, compute rolling averages for IMU noise reduction, and aggregate battery efficiency metrics.',
    learningObjectives: [
      'Load and inspect multi-channel robot telemetry DataFrames',
      'Filter noisy LiDAR and IMU time-series intervals',
      'Detect anomaly spikes and compute summary mission statistics',
    ],
    prerequisites: ['Python Fundamentals', 'NumPy'],
    difficultyRange: 'Intermediate',
    estimatedHours: 7,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-05',
    contentCoverage: 90,
    assessmentReadiness: 92,
  },
  {
    id: 'dom-sklearn',
    name: 'Scikit-learn',
    slug: 'scikit-learn',
    iconKey: 'sklearn',
    accentColor: '#D97706',
    shortDescription: 'Supervised obstacle classification, terrain clustering, and sensor regression pipelines.',
    detailedOverview:
      'Apply classical machine learning models to robotics perception problems: classify surface traction, cluster LiDAR point returns, and predict actuator wear.',
    learningObjectives: [
      'Split sensor datasets cleanly and normalize feature scales',
      'Train k-NN and linear regression predictors for range estimation',
      'Evaluate precision, recall, and cross-validation stability',
    ],
    prerequisites: ['NumPy', 'Pandas'],
    difficultyRange: 'Intermediate',
    estimatedHours: 9,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-03',
    contentCoverage: 88,
    assessmentReadiness: 85,
  },
  {
    id: 'dom-robotics',
    name: 'Robotics Fundamentals',
    slug: 'robotics-fundamentals',
    iconKey: 'robotics',
    accentColor: '#53b947',
    shortDescription: 'Differential-drive odometry, PID feedback control, forward kinematics, and obstacle avoidance.',
    detailedOverview:
      'Bridge math and motion in NewtonLab’s interactive 3D studio. Program differential-drive rovers and articulated 6-DOF manipulators with real-time path and joint feedback.',
    learningObjectives: [
      'Compute forward kinematics for multi-link robotic manipulators',
      'Implement proportional-derivative heading controllers for mobile rovers',
      'Plan collision-free waypoint paths around static workspace obstacles',
    ],
    prerequisites: ['NumPy'],
    difficultyRange: 'Intermediate – Advanced',
    estimatedHours: 14,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-11',
    contentCoverage: 100,
    assessmentReadiness: 100,
  },
  {
    id: 'dom-ros',
    name: 'ROS (Robot Operating System)',
    slug: 'ros',
    iconKey: 'ros',
    accentColor: '#7C3AED',
    shortDescription: 'Nodes, topics, Twist velocity messages, TF2 transforms, and autonomous navigation stacks.',
    detailedOverview:
      'Design decoupled robotics software using ROS 2 publish/subscribe architectures, service calls, geometry_msgs/Twist velocity commands, and coordinate transform trees.',
    learningObjectives: [
      'Architect publisher and subscriber nodes for sensor-to-actuator loops',
      'Construct Twist linear and angular velocity commands safely',
      'Verify TF2 frame chains and QoS reliability profiles',
    ],
    prerequisites: ['Robotics Fundamentals'],
    difficultyRange: 'Advanced',
    estimatedHours: 12,
    owner: 'Dr. Elena Vance',
    status: 'Published',
    updatedAt: '2026-11-10',
    contentCoverage: 82,
    assessmentReadiness: 80,
  },
];

export const INITIAL_MODULES: Module[] = [
  {
    id: 'mod-py-1',
    domainId: 'dom-python',
    order: 1,
    title: 'Python Control Flow & Telemetry Basics',
    description: 'Variables, loops, conditionals, and velocity clamping for safe autonomous rover motion.',
    difficulty: 'Beginner',
    estimatedHours: 4,
    learningObjectives: ['Write deterministic state transitions', 'Clamp actuator commands within safety bounds'],
    prerequisites: [],
    status: 'Published',
    assessmentId: 'assess-mod-py',
  },
  {
    id: 'mod-py-2',
    domainId: 'dom-python',
    order: 2,
    title: 'Functions & Waypoint Data Structures',
    description: 'Build reusable path-planning functions and tuple/dictionary waypoint pipelines.',
    difficulty: 'Beginner',
    estimatedHours: 4,
    learningObjectives: ['Compute Euclidean path lengths', 'Structure multi-waypoint rover missions'],
    prerequisites: ['mod-py-1'],
    status: 'Published',
    assessmentId: 'assess-mod-py',
  },
  {
    id: 'mod-np-1',
    domainId: 'dom-numpy',
    order: 3,
    title: 'Vector Geometry & Rotation Matrices',
    description: 'Use NumPy arrays and trigonometry to transform robot coordinates across 2D frames.',
    difficulty: 'Intermediate',
    estimatedHours: 5,
    learningObjectives: ['Apply 2D rotation matrices to pose vectors', 'Vectorize sensor range projections'],
    prerequisites: ['mod-py-2'],
    status: 'Published',
    assessmentId: 'assess-mod-np',
  },
  {
    id: 'mod-np-2',
    domainId: 'dom-numpy',
    order: 4,
    title: 'Point Cloud Filtering & Norms',
    description: 'Filter LiDAR obstacle scans using vectorized distance thresholds and array slicing.',
    difficulty: 'Intermediate',
    estimatedHours: 5,
    learningObjectives: ['Filter out-of-range LiDAR returns', 'Identify nearest obstacle bearings'],
    prerequisites: ['mod-np-1'],
    status: 'Published',
  },
  {
    id: 'mod-pd-1',
    domainId: 'dom-pandas',
    order: 5,
    title: 'Sensor Log Analysis with DataFrames',
    description: 'Inspect wheel encoder and IMU telemetry logs to detect slippage and drift.',
    difficulty: 'Intermediate',
    estimatedHours: 7,
    learningObjectives: ['Aggregate telemetry streams', 'Flag anomalous current spikes'],
    prerequisites: ['mod-np-2'],
    status: 'Published',
  },
  {
    id: 'mod-sk-1',
    domainId: 'dom-sklearn',
    order: 6,
    title: 'Terrain & Obstacle Classification',
    description: 'Train lightweight classifiers on simulated surface friction and sonar return features.',
    difficulty: 'Intermediate',
    estimatedHours: 9,
    learningObjectives: ['Prepare feature matrices', 'Score obstacle classification accuracy'],
    prerequisites: ['mod-pd-1'],
    status: 'Published',
  },
  {
    id: 'mod-rob-1',
    domainId: 'dom-robotics',
    order: 7,
    title: 'Differential-Drive Kinematics & Path Following',
    description: 'Compute wheel velocities, heading errors, and obstacle-avoiding trajectories in 3D.',
    difficulty: 'Intermediate',
    estimatedHours: 7,
    learningObjectives: ['Implement proportional heading control', 'Navigate around static cylindrical obstacles'],
    prerequisites: ['mod-np-1'],
    status: 'Published',
    assessmentId: 'assess-mod-rob',
  },
  {
    id: 'mod-rob-2',
    domainId: 'dom-robotics',
    order: 8,
    title: '6-DOF Robotic Arm Forward Kinematics',
    description: 'Calculate end-effector positions from joint angles and articulate the 3D robotic arm.',
    difficulty: 'Advanced',
    estimatedHours: 7,
    learningObjectives: ['Compute 2-link and 3-link planar reach', 'Command smooth joint targets'],
    prerequisites: ['mod-rob-1'],
    status: 'Published',
    assessmentId: 'assess-mod-rob',
  },
  {
    id: 'mod-ros-1',
    domainId: 'dom-ros',
    order: 9,
    title: 'ROS 2 Nodes, Topics & Twist Control',
    description: 'Model asynchronous publisher/subscriber callbacks and Twist velocity packets.',
    difficulty: 'Advanced',
    estimatedHours: 12,
    learningObjectives: ['Simulate ROS Twist publisher loops', 'Handle stale sensor watchdog timeouts'],
    prerequisites: ['mod-rob-2'],
    status: 'Published',
    assessmentId: 'assess-final',
  },
];

export const INITIAL_TASKS: CodingTask[] = [
  {
    id: 'task-py-1',
    moduleId: 'mod-py-1',
    domainId: 'dom-python',
    order: 1,
    title: 'Safe Velocity Clamping & Rover Forward Drive',
    taskType: 'Coding Exercise',
    difficulty: 'Beginner',
    status: 'Published',
    estimatedMinutes: 15,
    problemStatement:
      'Autonomous rovers must never exceed motor saturation limits. Write a function `clamp_velocity(v, max_speed=1.5)` that restricts velocity `v` to `[-max_speed, max_speed]`, then generate a straight-line rover path of 4 waypoints along +X.',
    instructions:
      '1. Implement `clamp_velocity(v, max_speed=1.5)` returning a float rounded to 2 decimal places.\n2. Print the clamped output for `v = 2.4`.\n3. Call `emit_rover_path(waypoints)` so the 3D simulator drives the rover cleanly.',
    learningObjectives: ['Enforce physical actuator bounds', 'Emit structured 3D simulation waypoints'],
    requirements: ['Handle negative and positive speeds symmetrically', 'Output must match exact 2-decimal precision'],
    starterCode: `def clamp_velocity(v, max_speed=1.5):
    # Clamp v between -max_speed and +max_speed
    clamped = max(-max_speed, min(max_speed, v))
    return round(clamped, 2)

speed = clamp_velocity(2.4)
print(f"Clamped: {speed}")

# Drive rover along a straight calibration path
waypoints = [
    {"x": 0.0, "z": 0.0},
    {"x": 1.5, "z": 0.0},
    {"x": 3.0, "z": 0.0},
]
emit_rover_path(waypoints)`,
    referenceSolution: `def clamp_velocity(v, max_speed=1.5):
    return round(max(-max_speed, min(max_speed, v)), 2)

speed = clamp_velocity(2.4)
print(f"Clamped: {speed}")
waypoints = [{"x": 0.0, "z": 0.0}, {"x": 1.5, "z": 0.0}, {"x": 3.0, "z": 0.0}]
emit_rover_path(waypoints)`,
    expectedOutput: 'Clamped: 1.5',
    hints: [
      'Use Python built-ins `min()` and `max()` together: `max(-max_speed, min(max_speed, v))`.',
      'Remember to wrap the final value in `round(..., 2)` so floats display cleanly.',
    ],
    testCases: [
      {
        id: 'tc-py1-1',
        name: 'Positive Saturation Clamp',
        input: 'print(clamp_velocity(2.4))',
        expectedOutput: 'Clamped: 1.5\n1.5',
        isHidden: false,
      },
      {
        id: 'tc-py1-2',
        name: 'Negative Saturation Clamp',
        input: 'print(clamp_velocity(-3.2, 1.2))',
        expectedOutput: 'Clamped: 1.5\n-1.2',
        isHidden: false,
      },
      {
        id: 'tc-py1-3',
        name: 'Nominal In-Range Pass-Through',
        input: 'print(clamp_velocity(0.75))',
        expectedOutput: 'Clamped: 1.5\n0.75',
        isHidden: true,
      },
    ],
    simulation: {
      mode: 'rover',
      defaultWaypoints: [{ x: 0, z: 0 }, { x: 1.5, z: 0 }, { x: 3.0, z: 0 }],
      obstacles: [{ x: 2.0, z: 2.2, radius: 0.45, label: 'Pylon A' }],
      targetPoint: { x: 3.0, y: 0, z: 0 },
    },
    updatedAt: '2026-11-08',
  },
  {
    id: 'task-py-2',
    moduleId: 'mod-py-2',
    domainId: 'dom-python',
    order: 2,
    title: 'Waypoint Euclidean Path Length',
    taskType: 'Simulation Lab',
    difficulty: 'Beginner',
    status: 'Published',
    estimatedMinutes: 20,
    problemStatement:
      'Before dispatching a rover mission, the planner validates total travel distance to verify battery budget. Implement `path_length(points)` for a list of `(x, z)` tuples and visualize the L-shaped survey route.',
    instructions:
      '1. Sum `math.hypot(x2 - x1, z2 - z1)` across consecutive waypoints.\n2. Return the total length rounded to 2 decimal places.\n3. Emit the survey waypoints to the 3D floor grid.',
    learningObjectives: ['Iterate pairs of 2D coordinates', 'Compute Euclidean segment distances'],
    requirements: ['Return 0.0 when fewer than 2 waypoints are provided'],
    starterCode: `import math

def path_length(points):
    if len(points) < 2:
        return 0.0
    total = 0.0
    for i in range(1, len(points)):
        dx = points[i][0] - points[i - 1][0]
        dz = points[i][1] - points[i - 1][1]
        total += math.hypot(dx, dz)
    return round(total, 2)

route = [(0, 0), (3, 0), (3, 4)]
print(f"Total Distance: {path_length(route)}m")
emit_rover_path([{"x": p[0], "z": p[1]} for p in route])`,
    referenceSolution: `import math
def path_length(points):
    if len(points) < 2:
        return 0.0
    total = sum(math.hypot(points[i][0]-points[i-1][0], points[i][1]-points[i-1][1]) for i in range(1, len(points)))
    return round(total, 2)
route = [(0, 0), (3, 0), (3, 4)]
print(f"Total Distance: {path_length(route)}m")
emit_rover_path([{"x": p[0], "z": p[1]} for p in route])`,
    expectedOutput: 'Total Distance: 7.0m',
    hints: ['A 3-4-5 right triangle or 3 + 4 orthogonal path makes distance easy to hand-verify.'],
    testCases: [
      {
        id: 'tc-py2-1',
        name: 'Orthogonal L-Route (3m + 4m)',
        input: 'print(path_length([(0,0),(3,0),(3,4)]))',
        expectedOutput: 'Total Distance: 7.0m\n7.0',
        isHidden: false,
      },
      {
        id: 'tc-py2-2',
        name: 'Empty / Single Point Safety',
        input: 'print(path_length([(1,1)]))',
        expectedOutput: 'Total Distance: 7.0m\n0.0',
        isHidden: true,
      },
    ],
    simulation: {
      mode: 'rover',
      defaultWaypoints: [{ x: 0, z: 0 }, { x: 3, z: 0 }, { x: 3, z: 4 }],
      obstacles: [{ x: 1.5, z: 2.0, radius: 0.5, label: 'Crate' }],
      targetPoint: { x: 3, y: 0, z: 4 },
    },
    updatedAt: '2026-11-08',
  },
  {
    id: 'task-np-1',
    moduleId: 'mod-np-1',
    domainId: 'dom-numpy',
    order: 1,
    title: '2D Pose Rotation Matrix with NumPy',
    taskType: 'Simulation Lab',
    difficulty: 'Intermediate',
    status: 'Published',
    estimatedMinutes: 25,
    problemStatement:
      'A LiDAR sensor detects an obstacle at local robot coordinates `(2.0, 0.0)`. Rotate that local vector into world coordinates when the rover yaw angle is `theta = math.pi / 4` (45 degrees).',
    instructions:
      '1. Implement `rotate_point(x, z, theta)` using `numpy.cos` and `numpy.sin`.\n2. Return `(round(wx, 2), round(wz, 2))`.\n3. Emit a rover trajectory toward the transformed world target.',
    learningObjectives: ['Construct 2D SO(2) rotation transforms', 'Convert local sensor detections to world coordinates'],
    requirements: ['Use radians for trigonometric functions'],
    starterCode: `import numpy as np

def rotate_point(x, z, theta):
    wx = x * np.cos(theta) - z * np.sin(theta)
    wz = x * np.sin(theta) + z * np.cos(theta)
    return (round(float(wx), 2), round(float(wz), 2))

world_pt = rotate_point(2.0, 0.0, np.pi / 4)
print(f"World Point: {world_pt}")
emit_rover_path([{"x": 0.0, "z": 0.0}, {"x": world_pt[0], "z": world_pt[1]}])`,
    referenceSolution: `import numpy as np
def rotate_point(x, z, theta):
    return (round(float(x * np.cos(theta) - z * np.sin(theta)), 2), round(float(x * np.sin(theta) + z * np.cos(theta)), 2))
world_pt = rotate_point(2.0, 0.0, np.pi / 4)
print(f"World Point: {world_pt}")
emit_rover_path([{"x": 0.0, "z": 0.0}, {"x": world_pt[0], "z": world_pt[1]}])`,
    expectedOutput: 'World Point: (1.41, 1.41)',
    hints: ['At 45 degrees, cos(pi/4) = sin(pi/4) ≈ 0.7071, so 2.0 * 0.7071 ≈ 1.41.'],
    testCases: [
      {
        id: 'tc-np1-1',
        name: '45-Degree Rotation',
        input: 'print(rotate_point(2.0, 0.0, np.pi / 4))',
        expectedOutput: 'World Point: (1.41, 1.41)\n(1.41, 1.41)',
        isHidden: false,
      },
      {
        id: 'tc-np1-2',
        name: '90-Degree Rotation',
        input: 'print(rotate_point(1.0, 0.0, np.pi / 2))',
        expectedOutput: 'World Point: (1.41, 1.41)\n(0.0, 1.0)',
        isHidden: true,
      },
    ],
    simulation: {
      mode: 'rover',
      defaultWaypoints: [{ x: 0, z: 0 }, { x: 1.41, z: 1.41 }],
      obstacles: [{ x: -1.5, z: 1.2, radius: 0.45 }],
      targetPoint: { x: 1.41, y: 0, z: 1.41 },
    },
    updatedAt: '2026-11-09',
  },
  {
    id: 'task-rob-1',
    moduleId: 'mod-rob-1',
    domainId: 'dom-robotics',
    order: 1,
    title: 'Obstacle-Avoiding Rover Waypoint Planner',
    taskType: 'Simulation Lab',
    difficulty: 'Intermediate',
    status: 'Published',
    estimatedMinutes: 30,
    problemStatement:
      'A barrier pillar sits at `(0.0, 1.8)` with safety clearance radius `0.9m`. Program a smooth curved detour trajectory from `(0, -2.5)` to `(0, 3.5)` that steers around the obstacle without colliding, and verify minimum clearance.',
    instructions:
      '1. Implement `min_clearance(waypoints, obs_x, obs_z)` returning the minimum Euclidean distance from any waypoint to the obstacle center.\n2. Ensure your waypoints maintain clearance >= 1.1m and reach `(0, 3.5)`.\n3. Watch the 3D autonomous rover navigate around the cylinder!',
    learningObjectives: ['Compute obstacle clearance margins', 'Validate collision-free waypoint sequences'],
    requirements: ['Clearance must exceed obstacle radius + robot half-width (1.1m)'],
    starterCode: `import math

def min_clearance(waypoints, obs_x, obs_z):
    dists = [math.hypot(w["x"] - obs_x, w["z"] - obs_z) for w in waypoints]
    return round(min(dists), 2)

# Modify or keep the detour arc around obstacle at (0.0, 1.8)
path = [
    {"x": -2.5, "z": -2.5},
    {"x": -1.4, "z": -0.5},
    {"x": -1.8, "z": 1.6},
    {"x": -0.8, "z": 3.2},
    {"x": 1.5, "z": 3.5},
]

clearance = min_clearance(path, 0.0, 1.8)
print(f"Min Clearance: {clearance}m")
print(f"Safe: {clearance >= 1.1}")
emit_rover_path(path)`,
    referenceSolution: `import math
def min_clearance(waypoints, obs_x, obs_z):
    return round(min(math.hypot(w["x"] - obs_x, w["z"] - obs_z) for w in waypoints), 2)
path = [{"x": -2.5, "z": -2.5}, {"x": -1.4, "z": -0.5}, {"x": -1.8, "z": 1.6}, {"x": -0.8, "z": 3.2}, {"x": 1.5, "z": 3.5}]
clearance = min_clearance(path, 0.0, 1.8)
print(f"Min Clearance: {clearance}m")
print(f"Safe: {clearance >= 1.1}")
emit_rover_path(path)`,
    expectedOutput: 'Min Clearance: 1.61m\nSafe: True',
    hints: [
      'Offsetting X to -1.8 around Z = 1.6 creates ~1.81m of radial clearance from (0.0, 1.8).',
      'Watch the indigo path ribbon in the 3D viewport to inspect clearance visually.',
    ],
    testCases: [
      {
        id: 'tc-rob1-1',
        name: 'Obstacle Clearance >= 1.1m',
        input: 'print(min_clearance(path, 0.0, 1.8) >= 1.1)',
        expectedOutput: 'Min Clearance: 1.61m\nSafe: True\nTrue',
        isHidden: false,
      },
      {
        id: 'tc-rob1-2',
        name: 'Goal Destination Reached',
        input: 'print(path[-1]["z"] >= 3.0)',
        expectedOutput: 'Min Clearance: 1.61m\nSafe: True\nTrue',
        isHidden: false,
      },
    ],
    simulation: {
      mode: 'rover',
      defaultWaypoints: [
        { x: -2.5, z: -2.5 },
        { x: -1.4, z: -0.5 },
        { x: -1.8, z: 1.6 },
        { x: -0.8, z: 3.2 },
        { x: 1.5, z: 3.5 },
      ],
      obstacles: [
        { x: 0.0, z: 1.8, radius: 0.65, label: 'Obstacle Cylinder' },
        { x: 1.8, z: -0.8, radius: 0.5, label: 'Sensor Beacon' },
      ],
      targetPoint: { x: 1.5, y: 0, z: 3.5 },
    },
    updatedAt: '2026-11-11',
  },
  {
    id: 'task-rob-2',
    moduleId: 'mod-rob-2',
    domainId: 'dom-robotics',
    order: 2,
    title: '3-Link Robotic Arm Forward Kinematics',
    taskType: 'Simulation Lab',
    difficulty: 'Advanced',
    status: 'Published',
    estimatedMinutes: 30,
    problemStatement:
      'Compute the planar reach `(r, height)` of an articulated robotic arm with upper boom `L1 = 1.6m` and forearm `L2 = 1.3m` given shoulder pitch `theta1` and elbow pitch `theta2` (in radians). Drive the 3D 6-DOF arm to pick up the target calibration block.',
    instructions:
      '1. Implement `arm_reach(theta1, theta2, L1=1.6, L2=1.3)` returning `(round(r, 2), round(h, 2))` where base height offset is `0.85m`.\n2. Command the 3D arm joints via `emit_arm_joints(yaw, shoulder, elbow, gripper)`.',
    learningObjectives: ['Apply planar 2-link forward kinematics', 'Articulate multi-joint 3D manipulators'],
    requirements: ['Angles are in radians; return tuple of floats rounded to 2 decimals'],
    starterCode: `import math

def arm_reach(theta1, theta2, L1=1.6, L2=1.3):
    r = L1 * math.sin(theta1) + L2 * math.sin(theta1 + theta2)
    h = 0.85 + L1 * math.cos(theta1) + L2 * math.cos(theta1 + theta2)
    return (round(r, 2), round(h, 2))

yaw = 0.65
shoulder = 0.55
elbow = 0.85
reach = arm_reach(shoulder, elbow)
print(f"End-Effector (r, h): {reach}")
emit_arm_joints(yaw, shoulder, elbow, 0.35)`,
    referenceSolution: `import math
def arm_reach(theta1, theta2, L1=1.6, L2=1.3):
    r = L1 * math.sin(theta1) + L2 * math.sin(theta1 + theta2)
    h = 0.85 + L1 * math.cos(theta1) + L2 * math.cos(theta1 + theta2)
    return (round(r, 2), round(h, 2))
reach = arm_reach(0.55, 0.85)
print(f"End-Effector (r, h): {reach}")
emit_arm_joints(0.65, 0.55, 0.85, 0.35)`,
    expectedOutput: 'End-Effector (r, h): (2.12, 2.43)',
    hints: ['Verify that when theta1 = 0 and theta2 = 0 (arm straight up), r = 0.0 and h = 0.85 + 1.6 + 1.3 = 3.75.'],
    testCases: [
      {
        id: 'tc-rob2-1',
        name: 'Articulated Reach Check',
        input: 'print(arm_reach(0.55, 0.85))',
        expectedOutput: 'End-Effector (r, h): (2.12, 2.43)\n(2.12, 2.43)',
        isHidden: false,
      },
      {
        id: 'tc-rob2-2',
        name: 'Vertical Home Pose (0, 0)',
        input: 'print(arm_reach(0.0, 0.0))',
        expectedOutput: 'End-Effector (r, h): (2.12, 2.43)\n(0.0, 3.75)',
        isHidden: true,
      },
    ],
    simulation: {
      mode: 'arm',
      defaultJoints: [0.65, 0.55, 0.85, 0.35],
      targetPoint: { x: 1.4, y: 0.4, z: 1.1 },
    },
    updatedAt: '2026-11-11',
  },
  {
    id: 'task-ros-1',
    moduleId: 'mod-ros-1',
    domainId: 'dom-ros',
    order: 1,
    title: 'ROS 2 Twist Differential Drive Publisher',
    taskType: 'Coding Exercise',
    difficulty: 'Advanced',
    status: 'Published',
    estimatedMinutes: 25,
    problemStatement:
      'Convert a ROS `geometry_msgs/Twist` command `(linear_x, angular_z)` into left and right wheel velocities `(v_left, v_right)` for a differential-drive robot with wheel separation `track_width = 0.5m`.',
    instructions:
      '1. Implement `twist_to_wheels(linear_x, angular_z, track_width=0.5)`.\n2. Use `v_left = linear_x - (angular_z * track_width / 2)` and `v_right = linear_x + (angular_z * track_width / 2)`.\n3. Simulate a curved arc trajectory in the 3D rover viewport.',
    learningObjectives: ['Translate ROS Twist messages to wheel kinematics', 'Verify curved turn radii'],
    requirements: ['Round both wheel velocities to 2 decimal places'],
    starterCode: `def twist_to_wheels(linear_x, angular_z, track_width=0.5):
    v_left = linear_x - (angular_z * track_width / 2.0)
    v_right = linear_x + (angular_z * track_width / 2.0)
    return (round(v_left, 2), round(v_right, 2))

wheels = twist_to_wheels(1.0, 0.8)
print(f"Wheel Velocities (L, R): {wheels}")
emit_rover_path([
    {"x": -2.0, "z": -1.5},
    {"x": -0.5, "z": -1.2},
    {"x": 0.8, "z": -0.2},
    {"x": 1.6, "z": 1.2},
    {"x": 1.9, "z": 2.8},
])`,
    referenceSolution: `def twist_to_wheels(linear_x, angular_z, track_width=0.5):
    return (round(linear_x - angular_z * track_width / 2.0, 2), round(linear_x + angular_z * track_width / 2.0, 2))
print(f"Wheel Velocities (L, R): {twist_to_wheels(1.0, 0.8)}")`,
    expectedOutput: 'Wheel Velocities (L, R): (0.8, 1.2)',
    hints: ['Positive angular_z turns counter-clockwise, meaning the right wheel spins faster than the left wheel.'],
    testCases: [
      {
        id: 'tc-ros1-1',
        name: 'CCW Turn Twist',
        input: 'print(twist_to_wheels(1.0, 0.8))',
        expectedOutput: 'Wheel Velocities (L, R): (0.8, 1.2)\n(0.8, 1.2)',
        isHidden: false,
      },
      {
        id: 'tc-ros1-2',
        name: 'Pure Spin-in-Place',
        input: 'print(twist_to_wheels(0.0, 2.0))',
        expectedOutput: 'Wheel Velocities (L, R): (0.8, 1.2)\n(-0.5, 0.5)',
        isHidden: true,
      },
    ],
    simulation: {
      mode: 'rover',
      defaultWaypoints: [
        { x: -2.0, z: -1.5 },
        { x: -0.5, z: -1.2 },
        { x: 0.8, z: -0.2 },
        { x: 1.6, z: 1.2 },
        { x: 1.9, z: 2.8 },
      ],
      obstacles: [{ x: -0.6, z: 1.4, radius: 0.5 }],
      targetPoint: { x: 1.9, y: 0, z: 2.8 },
    },
    updatedAt: '2026-11-10',
  },
];

export const INITIAL_CONTENT: LessonContent[] = [
  {
    id: 'cnt-1',
    domainId: 'dom-python',
    moduleId: 'mod-py-1',
    title: 'Actuator Safety & Deterministic Clamping in Python',
    type: 'Written Lesson',
    status: 'Published',
    durationMinutes: 12,
    summary: 'Learn why every physical robotics controller wraps raw command outputs in saturation clamps before sending PWM signals.',
    body: 'Physical motors have strict thermal and torque envelopes. Before dispatching velocity commands to wheel drivers, robotics engineers apply symmetric saturation clamping so upstream planner spikes never cause wheel slip or current faults.',
    codeSnippet: 'def clamp(val, limit=1.5):\n    return max(-limit, min(limit, val))',
    updatedAt: '2026-11-08',
    author: 'Dr. Elena Vance',
  },
  {
    id: 'cnt-2',
    domainId: 'dom-numpy',
    moduleId: 'mod-np-1',
    title: 'SO(2) Rotation Matrices & Body-to-World Frames',
    type: 'Code Example',
    status: 'Published',
    durationMinutes: 15,
    summary: 'Visualizing how 2x2 orthogonal matrices transform LiDAR obstacle detections from the rover frame into global map coordinates.',
    body: 'Every mobile robot tracks two coordinate frames: the local body frame (attached to the chassis center) and the fixed world map frame. Multiplying local coordinates by the yaw rotation matrix aligns sensor readings across time.',
    codeSnippet: 'R = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])',
    updatedAt: '2026-11-09',
    author: 'Dr. Elena Vance',
  },
  {
    id: 'cnt-3',
    domainId: 'dom-pandas',
    moduleId: 'mod-pd-1',
    title: 'Cleaning Noisy IMU Time-Series Logs',
    type: 'Coding Lab',
    status: 'Published',
    durationMinutes: 20,
    summary: 'Use rolling windows and quantile filters in Pandas to isolate gyroscope drift spikes during rover turns.',
    body: 'Field rovers experience high-frequency vibration over uneven floors. Applying a centered rolling median filter preserves sharp turn maneuvers while suppressing single-sample spikes.',
    codeSnippet: 'df["gyro_clean"] = df["gyro_z"].rolling(window=5).mean()',
    updatedAt: '2026-11-05',
    author: 'Dr. Elena Vance',
  },
  {
    id: 'cnt-4',
    domainId: 'dom-robotics',
    moduleId: 'mod-rob-1',
    title: 'Differential-Drive Kinematics Reference Guide',
    type: 'Documentation',
    status: 'Published',
    durationMinutes: 18,
    summary: 'Complete equations linking wheel track width, linear velocity, angular rate, and instantaneous center of curvature (ICC).',
    body: 'A two-wheel differential-drive rover steers by varying the relative speed between left and right drive wheels. When v_left == v_right, the robot moves straight; when v_left == -v_right, it pivots around its chassis center.',
    codeSnippet: 'v_linear = (v_right + v_left) / 2.0\nomega = (v_right - v_left) / track_width',
    updatedAt: '2026-11-11',
    author: 'Dr. Elena Vance',
  },
  {
    id: 'cnt-5',
    domainId: 'dom-robotics',
    moduleId: 'mod-rob-2',
    title: 'Articulated 6-DOF Manipulator Coordinate Frames',
    type: 'Video',
    status: 'Published',
    durationMinutes: 14,
    summary: 'Walkthrough of Denavit-Hartenberg conventions and base-to-gripper kinematic chains in the 3D simulator.',
    body: 'Each rotational joint introduces a local frame transformation. By chaining shoulder yaw, shoulder pitch, elbow pitch, and wrist pitch, we determine the exact 3D reach of the parallel gripper.',
    updatedAt: '2026-11-10',
    author: 'Dr. Elena Vance',
  },
  {
    id: 'cnt-6',
    domainId: 'dom-ros',
    moduleId: 'mod-ros-1',
    title: 'ROS 2 QoS Profiles for Sensor Streams',
    type: 'Reference Resource',
    status: 'Draft',
    durationMinutes: 10,
    summary: 'Best-effort vs Reliable QoS policies when streaming high-rate LiDAR scans over wireless links.',
    body: 'Draft reference sheet comparing sensor_data QoS profiles against reliable command topics for Twist actuators.',
    updatedAt: '2026-11-11',
    author: 'Dr. Elena Vance',
  },
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'assess-pre',
    title: 'Robotics Readiness Pre-Assessment',
    type: 'Pre-Assessment',
    domainId: 'dom-python',
    description:
      'Evaluates your baseline proficiency across Python control flow, NumPy linear algebra, sensor math, and basic kinematics to map your optimal starting module.',
    durationMinutes: 20,
    passingScore: 70,
    attemptLimit: 2,
    randomizeQuestions: false,
    randomizeOptions: false,
    status: 'Published',
    avgScore: 76,
    completionRate: 94,
    attemptsCount: 46,
    updatedAt: '2026-11-10',
    questions: [
      {
        id: 'q-pre-1',
        type: 'multiple-choice',
        prompt: 'What happens if a differential-drive rover receives v_left = 0.8 m/s and v_right = 1.2 m/s?',
        points: 20,
        difficulty: 'Beginner',
        skillCategory: 'Robotics Fundamentals',
        options: [
          'The rover drives straight forward at 1.0 m/s',
          'The rover moves forward while turning counter-clockwise (left)',
          'The rover spins in place clockwise without forward translation',
          'The rover reverses along the -X axis',
        ],
        correctOptionIndex: 1,
        explanation: 'Because v_right > v_left and average velocity is positive (1.0 m/s), the rover arcs forward to the left (CCW).',
      },
      {
        id: 'q-pre-2',
        type: 'multiple-choice',
        prompt: 'In NumPy, which operation computes the dot product of two 1D velocity vectors a and b without explicit Python loops?',
        points: 20,
        difficulty: 'Beginner',
        skillCategory: 'NumPy',
        options: ['np.hstack((a, b))', 'np.dot(a, b)', 'np.linspace(a, b, 2)', 'np.reshape(a, b)'],
        correctOptionIndex: 1,
        explanation: 'np.dot(a, b) computes the inner dot product of two 1D arrays in vectorized C/BLAS.',
      },
      {
        id: 'q-pre-3',
        type: 'multiple-choice',
        prompt: 'Which ROS 2 message type is standard for sending linear and angular velocity commands to a mobile base?',
        points: 20,
        difficulty: 'Intermediate',
        skillCategory: 'ROS',
        options: ['sensor_msgs/LaserScan', 'geometry_msgs/Twist', 'nav_msgs/OccupancyGrid', 'std_msgs/Float64MultiArray'],
        correctOptionIndex: 1,
        explanation: 'geometry_msgs/Twist encapsulates 3D linear (x, y, z) and angular (x, y, z) velocity vectors.',
      },
      {
        id: 'q-pre-4',
        type: 'coding',
        prompt:
          'Write a Python function `normalize_heading(deg)` that wraps any angle in degrees into `[0, 360)` and prints `normalize_heading(-45)`.',
        points: 40,
        difficulty: 'Beginner',
        skillCategory: 'Python Fundamentals',
        starterCode: `def normalize_heading(deg):
    # Wrap deg into [0, 360)
    return deg % 360

print(normalize_heading(-45))`,
        expectedOutput: '315',
        testCases: [
          { id: 'tc-q4-1', name: 'Negative Angle Wrap', input: 'print(normalize_heading(-45))', expectedOutput: '315\n315', isHidden: false },
          { id: 'tc-q4-2', name: 'Overflow Angle Wrap', input: 'print(normalize_heading(405))', expectedOutput: '315\n45', isHidden: true },
        ],
      },
    ],
    skillMappingRules: [
      {
        level: 'Beginner',
        minScore: 0,
        maxScore: 59,
        recommendedModuleId: 'mod-py-1',
        rationale: 'Start at Python Control Flow & Telemetry Basics to solidify core functions and actuator safety patterns.',
      },
      {
        level: 'Intermediate',
        minScore: 60,
        maxScore: 84,
        recommendedModuleId: 'mod-np-1',
        rationale: 'Your Python fundamentals are strong. Start at NumPy Vector Geometry & Rotation Matrices.',
      },
      {
        level: 'Advanced',
        minScore: 85,
        maxScore: 100,
        recommendedModuleId: 'mod-rob-1',
        rationale: 'High baseline fluency across Python and NumPy. Begin directly in Differential-Drive Kinematics & 3D Simulation.',
      },
    ],
  },
  {
    id: 'assess-mod-py',
    title: 'Python Robotics Core Module Assessment',
    type: 'Module Assessment',
    domainId: 'dom-python',
    moduleId: 'mod-py-1',
    description: 'Verifies mastery of velocity clamping, waypoint distances, and Python telemetry routines.',
    durationMinutes: 25,
    passingScore: 75,
    attemptLimit: 3,
    randomizeQuestions: true,
    randomizeOptions: true,
    status: 'Published',
    avgScore: 84,
    completionRate: 89,
    attemptsCount: 38,
    updatedAt: '2026-11-08',
    questions: [
      {
        id: 'q-py-1',
        type: 'multiple-choice',
        prompt: 'Why should actuator commands be clamped before publishing to motor controllers?',
        points: 25,
        difficulty: 'Beginner',
        skillCategory: 'Python Fundamentals',
        options: [
          'To convert radians into degrees automatically',
          'To protect motors from exceeding rated torque/velocity limits',
          'To increase Python interpreter memory usage',
          'To skip unit testing',
        ],
        correctOptionIndex: 1,
        explanation: 'Saturation clamping prevents software spikes from damaging physical actuators.',
      },
      {
        id: 'q-py-2',
        type: 'coding',
        prompt: 'Implement `safe_stop(distance)` returning True if obstacle distance < 0.5m, else False. Print `safe_stop(0.35)`.',
        points: 75,
        difficulty: 'Beginner',
        skillCategory: 'Python Fundamentals',
        starterCode: `def safe_stop(distance):
    return distance < 0.5

print(safe_stop(0.35))`,
        expectedOutput: 'True',
        testCases: [
          { id: 'tc-qpy2-1', name: 'Near Obstacle Trigger', input: 'print(safe_stop(0.35))', expectedOutput: 'True\nTrue', isHidden: false },
          { id: 'tc-qpy2-2', name: 'Safe Clearance', input: 'print(safe_stop(1.2))', expectedOutput: 'True\nFalse', isHidden: true },
        ],
      },
    ],
    skillMappingRules: [
      {
        level: 'Intermediate',
        minScore: 75,
        maxScore: 100,
        recommendedModuleId: 'mod-np-1',
        rationale: 'Module passed — proceed to NumPy Vector Geometry.',
      },
    ],
  },
  {
    id: 'assess-mod-np',
    title: 'NumPy Transformations & LiDAR Arrays Check',
    type: 'Module Assessment',
    domainId: 'dom-numpy',
    moduleId: 'mod-np-1',
    description: 'Assesses SO(2) coordinate transforms and vectorized Euclidean norm computation.',
    durationMinutes: 30,
    passingScore: 75,
    attemptLimit: 3,
    randomizeQuestions: false,
    randomizeOptions: true,
    status: 'Published',
    avgScore: 78,
    completionRate: 81,
    attemptsCount: 29,
    updatedAt: '2026-11-09',
    questions: [
      {
        id: 'q-np-1',
        type: 'multiple-choice',
        prompt: 'What is the determinant of any valid 2D or 3D pure rotation matrix R?',
        points: 50,
        difficulty: 'Intermediate',
        skillCategory: 'NumPy',
        options: ['0', '+1', '-1', 'Depends on rotation angle theta'],
        correctOptionIndex: 1,
        explanation: 'Proper rotation matrices in SO(n) preserve orientation and volume, so det(R) = +1.',
      },
      {
        id: 'q-np-2',
        type: 'multiple-choice',
        prompt: 'Which NumPy function computes the L2 Euclidean magnitude of a 3D velocity vector?',
        points: 50,
        difficulty: 'Intermediate',
        skillCategory: 'NumPy',
        options: ['np.linalg.norm(v)', 'np.shape(v)', 'np.zeros_like(v)', 'np.transpose(v)'],
        correctOptionIndex: 0,
        explanation: 'np.linalg.norm(v) computes the Euclidean (L2) norm by default.',
      },
    ],
    skillMappingRules: [],
  },
  {
    id: 'assess-mod-rob',
    title: 'Kinematics & Obstacle Navigation Practical',
    type: 'Practical Coding Assessment',
    domainId: 'dom-robotics',
    moduleId: 'mod-rob-1',
    description: 'Hands-on evaluation of mobile rover obstacle clearance and manipulator forward kinematics.',
    durationMinutes: 40,
    passingScore: 75,
    attemptLimit: 2,
    randomizeQuestions: false,
    randomizeOptions: false,
    status: 'Published',
    avgScore: 72,
    completionRate: 76,
    attemptsCount: 22,
    updatedAt: '2026-11-11',
    questions: [
      {
        id: 'q-rob-1',
        type: 'coding',
        prompt: 'Write `wheel_avg(v_l, v_r)` returning linear rover speed rounded to 2 decimals. Print `wheel_avg(0.8, 1.4)`.',
        points: 100,
        difficulty: 'Intermediate',
        skillCategory: 'Robotics Fundamentals',
        starterCode: `def wheel_avg(v_l, v_r):
    return round((v_l + v_r) / 2.0, 2)

print(wheel_avg(0.8, 1.4))`,
        expectedOutput: '1.1',
        testCases: [
          { id: 'tc-qrob-1', name: 'Asymmetric Forward Speed', input: 'print(wheel_avg(0.8, 1.4))', expectedOutput: '1.1\n1.1', isHidden: false },
        ],
      },
    ],
    skillMappingRules: [],
  },
  {
    id: 'assess-final',
    title: 'Autonomous Stack Capstone Final Assessment',
    type: 'Final Assessment',
    domainId: 'dom-ros',
    moduleId: 'mod-ros-1',
    description: 'Comprehensive end-of-track certification covering Python, NumPy, Kinematics, and ROS 2 Twist control.',
    durationMinutes: 45,
    passingScore: 80,
    attemptLimit: 2,
    randomizeQuestions: true,
    randomizeOptions: true,
    status: 'Draft',
    avgScore: 0,
    completionRate: 0,
    attemptsCount: 0,
    updatedAt: '2026-11-11',
    questions: [
      {
        id: 'q-fin-1',
        type: 'multiple-choice',
        prompt: 'Which TF2 frame typically serves as the fixed world-locked origin for odometry vs map fusion?',
        points: 100,
        difficulty: 'Advanced',
        skillCategory: 'ROS',
        options: ['base_link', 'map', 'laser_frame', 'caster_wheel'],
        correctOptionIndex: 1,
        explanation: 'In REP-105, map -> odom -> base_link is the standard mobile robot transform tree.',
      },
    ],
    skillMappingRules: [],
  },
];

export const INITIAL_RESULTS: AssessmentResult[] = [
  {
    id: 'res-1',
    assessmentId: 'assess-pre',
    assessmentTitle: 'Robotics Readiness Pre-Assessment',
    assessmentType: 'Pre-Assessment',
    domainId: 'dom-python',
    learnerId: 'user-assoc-1',
    learnerName: 'Marcus Chen',
    cohortId: 'cohort-alpha',
    submittedAt: '2026-10-18 09:42',
    timeTakenMinutes: 14,
    scorePercent: 80,
    passed: true,
    correctCount: 3,
    incorrectCount: 1,
    skippedCount: 0,
    recommendedModuleId: 'mod-np-1',
    recommendationReason: 'Strong Python foundations (100%). Mapped directly to NumPy Vector Geometry & Rotation Matrices.',
    topicBreakdown: [
      { topic: 'Python Fundamentals', correct: 1, total: 1, scorePercent: 100 },
      { topic: 'NumPy', correct: 1, total: 1, scorePercent: 100 },
      { topic: 'Robotics Fundamentals', correct: 1, total: 1, scorePercent: 100 },
      { topic: 'ROS', correct: 0, total: 1, scorePercent: 0 },
    ],
    answers: {
      'q-pre-1': { selectedOption: 1, isCorrect: true },
      'q-pre-2': { selectedOption: 1, isCorrect: true },
      'q-pre-3': { selectedOption: 0, isCorrect: false },
      'q-pre-4': { code: 'def normalize_heading(deg):\n    return deg % 360\nprint(normalize_heading(-45))', isCorrect: true },
    },
  },
  {
    id: 'res-2',
    assessmentId: 'assess-mod-np',
    assessmentTitle: 'NumPy Transformations & LiDAR Arrays Check',
    assessmentType: 'Module Assessment',
    domainId: 'dom-numpy',
    learnerId: 'user-assoc-1',
    learnerName: 'Marcus Chen',
    cohortId: 'cohort-alpha',
    submittedAt: '2026-11-04 16:15',
    timeTakenMinutes: 18,
    scorePercent: 100,
    passed: true,
    correctCount: 2,
    incorrectCount: 0,
    skippedCount: 0,
    recommendedModuleId: 'mod-rob-1',
    recommendationReason: 'Mastered SO(2) transforms and norms. Unlocked Robotics Fundamentals: Differential-Drive Kinematics.',
    topicBreakdown: [{ topic: 'NumPy', correct: 2, total: 2, scorePercent: 100 }],
    answers: {
      'q-np-1': { selectedOption: 1, isCorrect: true },
      'q-np-2': { selectedOption: 0, isCorrect: true },
    },
  },
  // Additional cohort learner records for SME Analytics & Report Generator
  {
    id: 'res-3',
    assessmentId: 'assess-mod-rob',
    assessmentTitle: 'Kinematics & Obstacle Navigation Practical',
    assessmentType: 'Practical Coding Assessment',
    domainId: 'dom-robotics',
    learnerId: 'learner-3',
    learnerName: 'Jordan Alverez',
    cohortId: 'cohort-alpha',
    submittedAt: '2026-11-09 11:20',
    timeTakenMinutes: 35,
    scorePercent: 58,
    passed: false,
    correctCount: 1,
    incorrectCount: 1,
    skippedCount: 0,
    recommendedModuleId: 'mod-rob-1',
    recommendationReason: 'Needs remedial practice on obstacle clearance geometry.',
    topicBreakdown: [{ topic: 'Robotics Fundamentals', correct: 1, total: 2, scorePercent: 58 }],
    answers: {},
  },
  {
    id: 'res-4',
    assessmentId: 'assess-mod-np',
    assessmentTitle: 'NumPy Transformations & LiDAR Arrays Check',
    assessmentType: 'Module Assessment',
    domainId: 'dom-numpy',
    learnerId: 'learner-4',
    learnerName: 'Priya Nair',
    cohortId: 'cohort-beta',
    submittedAt: '2026-11-10 14:05',
    timeTakenMinutes: 27,
    scorePercent: 62,
    passed: false,
    correctCount: 1,
    incorrectCount: 1,
    skippedCount: 0,
    recommendedModuleId: 'mod-np-1',
    recommendationReason: 'Review SO(2) rotation determinant properties.',
    topicBreakdown: [{ topic: 'NumPy', correct: 1, total: 2, scorePercent: 62 }],
    answers: {},
  },
  {
    id: 'res-5',
    assessmentId: 'assess-mod-py',
    assessmentTitle: 'Python Robotics Core Module Assessment',
    assessmentType: 'Module Assessment',
    domainId: 'dom-python',
    learnerId: 'learner-5',
    learnerName: 'Lucas Meyer',
    cohortId: 'cohort-beta',
    submittedAt: '2026-11-11 08:50',
    timeTakenMinutes: 19,
    scorePercent: 92,
    passed: true,
    correctCount: 2,
    incorrectCount: 0,
    skippedCount: 0,
    recommendedModuleId: 'mod-np-1',
    recommendationReason: 'Ready for NumPy array vectorization.',
    topicBreakdown: [{ topic: 'Python Fundamentals', correct: 2, total: 2, scorePercent: 92 }],
    answers: {},
  },
];

export const INITIAL_PROGRESS_BY_USER: Record<string, ProgressRecord> = {
  'user-assoc-1': {
    learnerId: 'user-assoc-1',
    completedTaskIds: ['task-py-1', 'task-py-2', 'task-np-1'],
    completedLessonIds: ['cnt-1', 'cnt-2', 'cnt-4'],
    completedModuleIds: ['mod-py-1', 'mod-py-2', 'mod-np-1'],
    unlockedModuleIds: ['mod-py-1', 'mod-py-2', 'mod-np-1', 'mod-np-2', 'mod-pd-1', 'mod-rob-1', 'mod-rob-2'],
    currentModuleId: 'mod-rob-1',
    currentTaskId: 'task-rob-1',
    streakDays: 9,
    hoursSpent: 24.5,
    weeklyGoalHours: 6,
    weeklyActivity: [
      { day: 'Mon', minutes: 45, tasks: 1 },
      { day: 'Tue', minutes: 65, tasks: 2 },
      { day: 'Wed', minutes: 35, tasks: 1 },
      { day: 'Thu', minutes: 80, tasks: 2 },
      { day: 'Fri', minutes: 55, tasks: 1 },
      { day: 'Sat', minutes: 40, tasks: 1 },
      { day: 'Sun', minutes: 50, tasks: 1 },
    ],
    skillProficiency: [
      { skill: 'Python', score: 94, target: 85 },
      { skill: 'NumPy', score: 88, target: 80 },
      { skill: 'Pandas', score: 72, target: 75 },
      { skill: 'Scikit-learn', score: 54, target: 70 },
      { skill: 'Kinematics', score: 76, target: 80 },
      { skill: 'ROS 2', score: 48, target: 75 },
    ],
    badges: [
      { id: 'b-1', title: 'Velocity Safety Architect', earnedAt: '2026-10-22', criteria: 'Passed all clamping boundary tests on first run' },
      { id: 'b-2', title: 'Frame Transformer', earnedAt: '2026-11-04', criteria: 'Scored 100% on NumPy SO(2) Rotation Assessment' },
      { id: 'b-3', title: '7-Day Lab Streak', earnedAt: '2026-11-10', criteria: 'Completed robotics coding exercises 7 days consecutively' },
    ],
  },
  'user-assoc-2': {
    learnerId: 'user-assoc-2',
    completedTaskIds: [],
    completedLessonIds: [],
    completedModuleIds: [],
    unlockedModuleIds: ['mod-py-1'],
    currentModuleId: 'mod-py-1',
    currentTaskId: 'task-py-1',
    streakDays: 1,
    hoursSpent: 0.5,
    weeklyGoalHours: 5,
    weeklyActivity: [
      { day: 'Mon', minutes: 0, tasks: 0 },
      { day: 'Tue', minutes: 0, tasks: 0 },
      { day: 'Wed', minutes: 0, tasks: 0 },
      { day: 'Thu', minutes: 0, tasks: 0 },
      { day: 'Fri', minutes: 0, tasks: 0 },
      { day: 'Sat', minutes: 15, tasks: 0 },
      { day: 'Sun', minutes: 15, tasks: 0 },
    ],
    skillProficiency: [
      { skill: 'Python', score: 45, target: 85 },
      { skill: 'NumPy', score: 30, target: 80 },
      { skill: 'Pandas', score: 25, target: 75 },
      { skill: 'Scikit-learn', score: 20, target: 70 },
      { skill: 'Kinematics', score: 25, target: 80 },
      { skill: 'ROS 2', score: 15, target: 75 },
    ],
    badges: [],
  },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'assessment',
    title: 'New Practical Assessment Assigned',
    message: 'Kinematics & Obstacle Navigation Practical is ready in your Robotics Fundamentals track.',
    timestamp: '18 mins ago',
    read: false,
    actionLabel: 'Open Assessment',
    actionRoute: '/associate/assessment/assess-mod-rob',
    roleTarget: 'ASSOCIATE',
  },
  {
    id: 'notif-2',
    category: 'learning',
    title: '3D Simulation Module Unlocked',
    message: 'Your 100% score on NumPy Transformations unlocked Differential-Drive Kinematics & Path Following.',
    timestamp: '2 hours ago',
    read: false,
    actionLabel: 'Launch 3D Workspace',
    actionRoute: '/associate/workspace/task-rob-1',
    roleTarget: 'ASSOCIATE',
  },
  {
    id: 'notif-3',
    category: 'system',
    title: 'AI Task Audit Suggestion',
    message: 'NewtonLab AI flagged 2 edge-case test gaps in "Obstacle-Avoiding Rover Waypoint Planner".',
    timestamp: '45 mins ago',
    read: false,
    actionLabel: 'Review in Task Editor',
    actionRoute: '/sme/tasks/task-rob-1',
    roleTarget: 'SME',
  },
  {
    id: 'notif-4',
    category: 'assessment',
    title: 'Cohort Beta Struggling Learner Alert',
    message: '2 trainees scored below 65% on NumPy Transformations & LiDAR Arrays Check.',
    timestamp: '3 hours ago',
    read: false,
    actionLabel: 'View Report',
    actionRoute: '/sme/reports',
    roleTarget: 'SME',
  },
  {
    id: 'notif-5',
    category: 'learning',
    title: 'Weekly Goal Milestone Reached',
    message: 'You logged 6.2 hours of coding & simulation practice this week.',
    timestamp: 'Yesterday',
    read: true,
    actionLabel: 'View Progress',
    actionRoute: '/associate/progress',
    roleTarget: 'ALL',
  },
];

export const INITIAL_SAVED_REPORTS: SavedReport[] = [
  {
    id: 'rep-1',
    title: 'Cohort Alpha — Autumn Robotics Readiness',
    reportType: 'Combined Assignment and Assessment Report',
    createdAt: '2026-11-10',
    schedule: 'Weekly',
    domainFilter: 'All Domains',
    cohortFilter: 'Cohort Alpha — Autumn 2026',
    avgScore: 83,
    completionRate: 88,
  },
  {
    id: 'rep-2',
    title: 'NumPy & Kinematics Difficulty Audit',
    reportType: 'Assessment Performance',
    createdAt: '2026-11-06',
    schedule: 'Monthly',
    domainFilter: 'Robotics Fundamentals',
    cohortFilter: 'All Cohorts',
    avgScore: 74,
    completionRate: 79,
  },
];
