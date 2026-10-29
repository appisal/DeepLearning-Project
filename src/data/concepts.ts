// Comprehensive Deep Learning Generalization Concepts & Field Notes

export interface ConceptInfo {
  id: string;
  name: string;
  category: 'REGIME' | 'DEFENSE' | 'DIAGNOSTIC';
  tag: string;
  color: string;
  shortDesc: string;
  equation: string;
  equationNote: string;
  biasLevel: string;
  varianceLevel: string;
  trainLossState: string;
  valLossState: string;
  studentAnalogy: string;
  symptoms: string[];
  rootCauses: string[];
  remedies: string[];
  codeSnippet: {
    language: string;
    title: string;
    code: string;
  };
  deepDiveText: string;
}

export const CONCEPTS: ConceptInfo[] = [
  {
    id: 'underfitting',
    name: 'Underfitting (High Bias)',
    category: 'REGIME',
    tag: 'TOO SIMPLE',
    color: '#ffb86c', // Warm amber
    shortDesc: 'The model is too rigid to capture the true underlying data patterns, failing on both training and test data.',
    equation: 'Error ≈ Bias² + Irreducible Noise',
    equationNote: 'Bias is high because the model hypothesis space excludes the true data distribution.',
    biasLevel: 'High',
    varianceLevel: 'Low',
    trainLossState: 'High (never reaches acceptable convergence)',
    valLossState: 'High (tracks train loss closely, both poor)',
    studentAnalogy: 'The Slacker: Only read the textbook chapter headings. Arrives at the exam with zero detailed understanding and fails both the practice questions and the actual exam.',
    symptoms: [
      'High training loss even after hundreds of epochs',
      'Training loss and validation loss are both plateaued high and close together',
      'Predictions look like a flat line or rigid plane across a clearly curved dataset',
      'Low $R^2$ score or low classification accuracy across all splits',
    ],
    rootCauses: [
      'Model architecture is too shallow or has too few parameters (e.g., linear regression on non-linear data)',
      'Excessive regularization (weight decay or dropout set too high)',
      'Insufficient or uninformative input features',
      'Training halted too early or learning rate too low to escape poor initial basin',
    ],
    remedies: [
      'Increase model capacity: Add layers, neurons, or polynomial feature terms',
      'Reduce regularization penalty (decrease $\\lambda$ or lower dropout rate)',
      'Engineer new informative features or remove overly aggressive pooling',
      'Switch to a more expressive non-linear architecture (e.g., Deep MLP, CNN, Transformer)',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Fixing Underfitting in PyTorch (Increasing Capacity)',
      code: `# UNDERFIT MODEL: Too small (1 linear layer)
# model = nn.Linear(in_features=10, out_features=1)

# FIXED MODEL: Increased capacity with non-linear activations
import torch.nn as nn

class RobustPredictor(nn.Module):
    def __init__(self, in_features, out_features):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, out_features)
        )
    def forward(self, x):
        return self.net(x)`,
    },
    deepDiveText:
      'Underfitting occurs when a machine learning model is unable to capture the underlying trend of the data. In mathematical terms, the expected difference between the predicted value and the ground truth (Bias) is large. Because the model hypothesis class is too constrained, it makes strong, simplistic assumptions about the target function that do not hold in reality.',
  },
  {
    id: 'optimal',
    name: 'Optimal Generalization (The Sweet Spot)',
    category: 'REGIME',
    tag: 'JUST RIGHT',
    color: '#34d399', // Crisp emerald
    shortDesc: 'The Goldilocks zone: The model captures genuine patterns while ignoring random noise, achieving minimal test error.',
    equation: '\\min_\\theta \\; \\mathbb{E}_{(x, y) \\sim \\mathcal{D}}[\\mathcal{L}(f_\\theta(x), y)]',
    equationNote: 'The model minimizes expected generalization loss on unseen data sampled from distribution D.',
    biasLevel: 'Balanced',
    varianceLevel: 'Balanced',
    trainLossState: 'Low and converged stably',
    valLossState: 'Low and closely tracking training loss',
    studentAnalogy: 'The Critical Thinker: Understood the fundamental mathematical principles behind the subject. Tolerates slight variations in questions and comfortably scores top grades on both homework and unseen finals.',
    symptoms: [
      'Smooth, well-behaved decision boundaries and curves',
      'Training loss and validation loss descend together with a modest, stable gap',
      'Consistent performance across cross-validation folds and holdout sets',
      'Predictions capture macro waves without jagged oscillations around noise dots',
    ],
    rootCauses: [
      'Model capacity is well matched to the complexity of the underlying data generating process',
      'Appropriate regularization prevents memorization of idiosyncrasies',
      'Sufficient representative training data covering the target domain',
    ],
    remedies: [
      'Preserve current hyperparameters and save model weights checkpoint',
      'Deploy model and monitor for real-world distribution drift',
      'Use ensemble techniques if marginal gains are needed without overfitting',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Balanced Network with Moderate Regularization',
      code: `import torch.nn as nn
import torch.optim as optim

# Balanced architecture with mild regularization
model = nn.Sequential(
    nn.Linear(10, 32),
    nn.BatchNorm1d(32),
    nn.ReLU(),
    nn.Dropout(p=0.15), # Mild dropout to discourage co-adaptation
    nn.Linear(32, 1)
)

# Weight decay (L2 regularization) sets optimal smoothness
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)`,
    },
    deepDiveText:
      'The optimal regime represents the zenith of machine learning: generalization. The model embodies Occam’s Razor—it is as simple as possible to explain the observed phenomena, but no simpler. It does not waste capacity trying to account for measurement errors or noise spikes, ensuring high accuracy on future, unseen examples.',
  },
  {
    id: 'overfitting',
    name: 'Overfitting (High Variance)',
    category: 'REGIME',
    tag: 'TOO COMPLEX',
    color: '#ff6b81', // Neon rose/red
    shortDesc: 'The model memorizes the training data including random noise, resulting in flawless training accuracy but catastrophic failure on unseen test data.',
    equation: '\\text{Gap} = \\mathcal{L}_{\\text{val}} - \\mathcal{L}_{\\text{train}} \\gg 0',
    equationNote: 'Large generalization gap: Training loss converges to ~0 while validation error diverges.',
    biasLevel: 'Low',
    varianceLevel: 'High',
    trainLossState: 'Near 0 (near 100% training accuracy)',
    valLossState: 'Diverges and starts increasing after a certain epoch',
    studentAnalogy: 'The Crammer: Memorized the past 5 years of exam question papers word-for-word, including typos! Gets 100% on the exact practice test, but fails completely when questions are rephrased on the real exam.',
    symptoms: [
      'Near-zero training loss, but validation loss spikes upward (U-curve)',
      'Decision boundaries feature bizarre tentacles or isolated islands around single outlier points',
      'Fitted polynomial curve exhibits wild oscillations (Runge phenomenon) between data points',
      'Model parameters have huge magnitude weights',
    ],
    rootCauses: [
      'Model has far too many parameters relative to the number of training samples ($P \\gg N$)',
      'Training for too many epochs without early stopping',
      'Zero or inadequate regularization (no weight decay, no dropout)',
      'Noisy labels or small, unrepresentative training dataset',
    ],
    remedies: [
      'Introduce L2 Regularization (Weight Decay) or L1 Regularization (Lasso)',
      'Apply Dropout in neural network hidden layers ($p = 0.2 - 0.5$)',
      'Enforce Early Stopping using a validation set checkpoint',
      'Collect more training data or apply Data Augmentation',
      'Simplify architecture (prune layers, reduce polynomial degree)',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Taming Overfitting with Early Stopping & Dropout',
      code: `import torch
import torch.nn as nn

class AntiOverfitNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(64, 128)
        self.drop = nn.Dropout(0.3) # Disables 30% of neurons randomly
        self.fc2 = nn.Linear(128, 1)

# Early Stopping hook in training loop:
best_val_loss = float('inf')
patience, strikes = 5, 0

for epoch in range(100):
    train_loss = train_one_epoch()
    val_loss = validate()
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        strikes = 0
        torch.save(model.state_dict(), 'best_model.pth')
    else:
        strikes += 1
        if strikes >= patience:
            print(f"Early stopping triggered at epoch {epoch}!")
            break`,
    },
    deepDiveText:
      'Overfitting occurs when a model learns the detail and noise in the training data to the extent that it negatively impacts the performance of the model on new data. The model treats noise as genuine structural truth. In polynomial regression, this manifests as extreme oscillations between points as coefficients blow up into the tens of thousands.',
  },
  {
    id: 'bias-variance',
    name: 'Bias-Variance Tradeoff',
    category: 'DIAGNOSTIC',
    tag: 'THE CORE LAW',
    color: '#9f8cff', // Electric violet
    shortDesc: 'Total error is the sum of Bias² (underfitting), Variance (overfitting), and irreducible noise. Tuning model capacity trades one for the other.',
    equation: '\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}[\\hat{f}(x)]^2 + \\text{Var}[\\hat{f}(x)] + \\sigma^2',
    equationNote: 'Total Expected Test Error = (High Bias Error) + (High Variance Error) + (Random Noise).',
    biasLevel: 'Balanced',
    varianceLevel: 'Balanced',
    trainLossState: 'Guides model complexity selection',
    valLossState: 'Reaches minimum at the intersection point',
    studentAnalogy: 'Archery Target: Bias means all arrows land far from the bullseye in a tight cluster (systematic error). Variance means arrows scatter wildly all over the board. The goal is tight grouping on the bullseye.',
    symptoms: [
      'Model tuning is a tug-of-war: decreasing bias often increases variance',
      'As model capacity rises, training error drops monotonically, but test error forms a U-shape',
    ],
    rootCauses: [
      'Mathematical consequence of estimating a target distribution from finite, noisy samples',
    ],
    remedies: [
      'Plot validation curves against hyperparameters to find the minimum of the U-curve',
      'Use cross-validation to locate the optimal complexity point',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Scikit-Learn Validation Curve for Bias-Variance Tradeoff',
      code: `from sklearn.model_selection import validation_curve
from sklearn.linear_model import Ridge
import numpy as np

# Sweep regularization alpha to locate Bias-Variance sweet spot
param_range = np.logspace(-4, 4, 10)
train_scores, test_scores = validation_curve(
    Ridge(), X, y,
    param_name="alpha",
    param_range=param_range,
    scoring="neg_mean_squared_error",
    cv=5
)`,
    },
    deepDiveText:
      'The bias-variance tradeoff is a fundamental property of all supervised learning. Bias measures how far off the model’s predictions are on average across different training sets. Variance measures how much the predictions fluctuate when trained on different training sets of the same size.',
  },
  {
    id: 'regularization',
    name: 'L2 Regularization (Ridge / Weight Decay)',
    category: 'DEFENSE',
    tag: 'WEIGHT PENALTY',
    color: '#5ed9d0', // Cyber cyan
    shortDesc: 'Penalizes large weight values in the loss function, forcing the model to find smooth, simple curves instead of erratic oscillations.',
    equation: '\\mathcal{L}_{\\text{reg}} = \\mathcal{L}_{\\text{MSE}} + \\lambda \\sum_{i} w_i^2',
    equationNote: 'Adds a squared magnitude penalty scaled by lambda. Drives weights smoothly toward zero.',
    biasLevel: 'Slightly Increased',
    varianceLevel: 'Significantly Reduced',
    trainLossState: 'Slightly higher (prevents 0 loss)',
    valLossState: 'Significantly lower (flattens generalization gap)',
    studentAnalogy: 'Speed Limit on a Highway: Without a speed limit, an over-enthusiastic driver swerves wildly at 200 km/h. L2 regularization keeps the vehicle at a smooth, stable 80 km/h, preventing crashes on unexpected turns.',
    symptoms: [
      'Without regularization, polynomial coefficients blow up to +14,000 and -12,000',
      'With L2 regularization, weights remain constrained (e.g., between -2 and +2)',
    ],
    rootCauses: [
      'Unconstrained optimization exploits degree of freedom to fit noise',
    ],
    remedies: [
      'Tune weight decay $\\lambda$ via grid search or logarithmic sweep',
      'Use AdamW or SGD with weight_decay parameter in PyTorch',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Applying L2 Regularization (Weight Decay)',
      code: `# In PyTorch:
import torch.optim as optim

# weight_decay parameter directly implements L2 regularization
optimizer = optim.AdamW(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01 # L2 penalty lambda
)`,
    },
    deepDiveText:
      'Ridge regularization (L2) prevents coefficients from growing excessively large. In curve fitting, high-degree polynomials produce crazy oscillations precisely because positive and negative coefficients cancel each other out violently. Constraining $\\sum w_i^2$ suppresses these high-frequency wiggles, producing smooth, robust approximations.',
  },
  {
    id: 'dropout',
    name: 'Dropout & Neural Pruning',
    category: 'DEFENSE',
    tag: 'STOCHASTIC MASK',
    color: '#38bdf8', // Sky blue
    shortDesc: 'Randomly zeroes out a percentage of neurons during each training pass, preventing neurons from relying on brittle co-adaptations.',
    equation: 'h^{(l)} = \\frac{1}{1-p} \\cdot (r^{(l)} \\odot a^{(l)}), \\quad r_i \\sim \\text{Bernoulli}(1-p)',
    equationNote: 'Neurons are dropped with probability p during training; scaled by 1/(1-p) for inverted dropout.',
    biasLevel: 'Mild Increase',
    varianceLevel: 'Massive Drop',
    trainLossState: 'Trains slightly slower, preventing instant memorization',
    valLossState: 'Maintains stability and tracks real generalization',
    studentAnalogy: 'Surprise Quizzes with Random Study Group Members: If one student always whispers the answer, others never learn. Dropout temporarily removes random group members, forcing every student to learn self-reliance.',
    symptoms: [
      'Neurons forming co-dependent alliances where one neuron fixes another neuron’s error on specific training samples',
    ],
    rootCauses: [
      'Dense connectivity allows deep networks to memorize specific feature combinations',
    ],
    remedies: [
      'Place nn.Dropout(0.2 - 0.5) between fully connected layers',
      'Ensure model.eval() is called during inference so all neurons are active!',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Implementing Dropout in Neural Networks',
      code: `import torch.nn as nn

class RegularizedMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(p=0.4), # Drops 40% of neurons during training
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(p=0.2), # Drops 20%
            nn.Linear(64, 10)
        )
    def forward(self, x):
        return self.classifier(x)`,
    },
    deepDiveText:
      'Proposed by Nitish Srivastava and Geoffrey Hinton, dropout approximates training an exponential ensemble of thinned sub-networks. Because a neuron cannot rely on the presence of any other specific neuron, it is forced to extract genuinely informative, robust features that work across diverse contexts.',
  },
  {
    id: 'early-stopping',
    name: 'Early Stopping & Checkpoints',
    category: 'DEFENSE',
    tag: 'TIMING CONTROL',
    color: '#a78bfa', // Purple
    shortDesc: 'Monitors validation loss during training and halts optimization the moment validation performance stops improving.',
    equation: 't^* = \\arg\\min_{t} \\; \\mathcal{L}_{\\text{val}}(\\theta^{(t)})',
    equationNote: 'Halts training at epoch t* when validation error hits the nadir of the U-curve.',
    biasLevel: 'Optimal',
    varianceLevel: 'Optimal',
    trainLossState: 'Still decreasing, but stopped before memorization starts',
    valLossState: 'Captured at its absolute global minimum',
    studentAnalogy: 'Stopping Exam Prep at 10 PM: Studying past 10 PM leads to sleep deprivation and diminishing returns. Early stopping means going to bed at peak readiness rather than burning out.',
    symptoms: [
      'Training loss keeps going down at epoch 40, 50, 60, but validation loss hit bottom at epoch 22 and is rising',
    ],
    rootCauses: [
      'Over-optimizing empirical training risk beyond the point of generalization utility',
    ],
    remedies: [
      'Use EarlyStopping callback in PyTorch Lightning or Keras',
      'Save the best weights checkpoint based on validation loss, not training loss',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Early Stopping Implementation',
      code: `# Native PyTorch Early Stopping Checkpoint Logic:
best_loss = float('inf')
patience = 7
patience_counter = 0

for epoch in range(max_epochs):
    train(model, train_loader)
    val_loss = evaluate(model, val_loader)
    
    if val_loss < best_loss:
        best_loss = val_loss
        patience_counter = 0
        save_checkpoint(model, 'best_checkpoint.pt')
    else:
        patience_counter += 1
        if patience_counter >= patience:
            print("Validation loss degraded for 7 epochs. Halting!")
            break`,
    },
    deepDiveText:
      'Early stopping is mathematically equivalent to L2 regularization under gradient descent with small step sizes. By restricting the number of gradient descent iterations, the effective parameter search space is confined around the initialization, preventing parameters from growing into high-variance territories.',
  },
  {
    id: 'data-augmentation',
    name: 'Data Augmentation & Sample Expansion',
    category: 'DEFENSE',
    tag: 'MORE DATA',
    color: '#2dd4bf', // Teal
    shortDesc: 'Increasing the quantity and diversity of training data to physically prevent the model from memorizing idiosyncrasies.',
    equation: '\\mathcal{D}_{\\text{aug}} = \\{(T(x), y) \\mid (x, y) \\in \\mathcal{D}, \\; T \\sim \\mathcal{T}\\}',
    equationNote: 'Applies label-preserving transformations T (rotation, noise, cropping) to expand sample space.',
    biasLevel: 'Low',
    varianceLevel: 'Very Low',
    trainLossState: 'Harder to fit, but matches true domain distribution',
    valLossState: 'Dramatically lower and closer to training error',
    studentAnalogy: 'Practicing 500 Varied Questions instead of 10: If a student solves hundreds of differently phrased problems, they are forced to understand the underlying logic rather than memorizing numbers.',
    symptoms: [
      'Small dataset ($N < 500$) with a complex model ($P > 100,000$ parameters)',
    ],
    rootCauses: [
      'Sparsity in high-dimensional feature spaces allows models to construct arbitrary decision boundaries between points',
    ],
    remedies: [
      'Apply domain-specific data augmentations (e.g. flips, jitter, Mixup, CutMix)',
      'Collect additional real-world samples for underrepresented edge cases',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Torchvision Data Augmentation Pipeline',
      code: `from torchvision import transforms

# Transform pipeline expands effective dataset diversity
train_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])`,
    },
    deepDiveText:
      'More data is the ultimate cure for high variance. As dataset size $N \\to \\infty$, variance error shrinks toward zero because the empirical distribution converges to the true data distribution. When acquiring new data is expensive, label-preserving transformations synthetically enforce invariances into the model.',
  },
];
