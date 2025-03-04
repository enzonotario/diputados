import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCardViewProps<T> {
  data: T[];
  columns: {
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
  }[];
  onCardClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataCardView<T>({
  data,
  columns,
  onCardClick,
  emptyMessage = "No hay datos disponibles",
}: DataCardViewProps<T>) {
  function getNestedValue(obj: any, path: string) {
    const keys = path.split(".");
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);
  }

  if (data.length === 0) {
    return <div className="text-center py-8">{emptyMessage}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((item, index) => {
        // Find a title column (usually the first or second column)
        const titleColumn = columns.find(col =>
          col.key.toLowerCase().includes('nombre') ||
          col.key.toLowerCase().includes('titulo') ||
          col.key.toLowerCase().includes('name') ||
          col.key.toLowerCase().includes('title')
        ) || columns[0];

        return (
          <Card
            key={index}
            className={onCardClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
            onClick={() => onCardClick && onCardClick(item)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {titleColumn.render
                  ? titleColumn.render(item)
                  : getNestedValue(item, titleColumn.key)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="grid grid-cols-2 gap-2">
                {columns
                  .filter(col => col.key !== titleColumn.key)
                  .map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {column.title}
                      </dt>
                      <dd className="text-sm">
                        {column.render
                          ? column.render(item)
                          : getNestedValue(item, column.key)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
