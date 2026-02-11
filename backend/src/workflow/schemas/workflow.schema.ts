import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkflowDocument = Workflow & Document;

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ required: true, default: 'New Workflow' })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Object, default: {} })
  graphData: {
    nodes: any[];
    edges: any[];
  };
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
