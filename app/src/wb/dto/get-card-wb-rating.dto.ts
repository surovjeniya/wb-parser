export class GetCardWbRatingDto {
  title: string;
  gender: string;
  brand: string;
  nm_id: number;
  subj_name: string;
  subject_id: number;
  subj_root_id: number;
  subj_root_name: string;
  description: string;
  characteristics: {
    charc_name: string;
    value: number;
    unit_name: string;
  }[];
  temp_img_batch: {
    supplier_id: number;
    x_supplier_id: string;
    images: string[];
  };
}
