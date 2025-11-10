import { ComponentConfig } from "@measured/puck";

export type Feature = {
  title: string;
  description: string;
  icon?: string;
};

export type FeatureListProps = {
  features: Feature[];
  columns: 2 | 3 | 4;
};

export const FeatureListConfig: ComponentConfig<FeatureListProps> = {
  label: "Feature List",
  fields: {
    features: {
      type: "array",
      label: "Features",
      arrayFields: {
        title: {
          type: "text",
          label: "Title",
        },
        description: {
          type: "textarea",
          label: "Description",
        },
        icon: {
          type: "text",
          label: "Icon (emoji)",
        },
      },
      defaultItemProps: {
        title: "Feature Title",
        description: "Feature description",
        icon: "⭐",
      },
    },
    columns: {
      type: "radio",
      label: "Columns",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
  },
  defaultProps: {
    features: [
      {
        title: "Fast",
        description: "Lightning fast performance",
        icon: "⚡",
      },
      {
        title: "Reliable",
        description: "Built to last",
        icon: "🛡️",
      },
      {
        title: "Easy to Use",
        description: "Simple and intuitive",
        icon: "✨",
      },
    ],
    columns: 3,
  },
  render: ({ features, columns }) => {
    const gridCols = {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    };

    return (
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
            {features.map((feature, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {feature.icon && (
                  <div className="text-4xl mb-4">{feature.icon}</div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
