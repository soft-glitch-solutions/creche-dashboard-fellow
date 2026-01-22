export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          application_id?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_form_config: {
        Row: {
          created_at: string
          creche_id: string
          display_order: number
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_enabled: boolean
          is_required: boolean
          section: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creche_id: string
          display_order?: number
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          section?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creche_id?: string
          display_order?: number
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          section?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_form_config_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      application_lifecycle_stages: {
        Row: {
          created_at: string
          creche_id: string
          display_order: number
          id: string
          is_active: boolean
          stage_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creche_id: string
          display_order?: number
          id?: string
          is_active?: boolean
          stage_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creche_id?: string
          display_order?: number
          id?: string
          is_active?: boolean
          stage_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_lifecycle_stages_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          note: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          note: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_application"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      application_waiting_list: {
        Row: {
          application_id: string
          class_id: string
          created_at: string | null
          creche_id: string
          id: string
          notes: string | null
          position: number
          status: string
          updated_at: string | null
        }
        Insert: {
          application_id: string
          class_id: string
          created_at?: string | null
          creche_id: string
          id?: string
          notes?: string | null
          position?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          class_id?: string
          created_at?: string | null
          creche_id?: string
          id?: string
          notes?: string | null
          position?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_waiting_list_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_waiting_list_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "creche_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_waiting_list_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_status: string | null
          child_id: string | null
          class_id: string | null
          created_at: string | null
          creche_id: string | null
          id: string
          lifecycle_stage: string | null
          message: string
          notes: string | null
          number_of_children: number | null
          offer_response: string | null
          parent_address: string | null
          parent_email: string
          parent_name: string
          parent_phone_number: string
          parent_whatsapp: string | null
          source: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          child_id?: string | null
          class_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          lifecycle_stage?: string | null
          message: string
          notes?: string | null
          number_of_children?: number | null
          offer_response?: string | null
          parent_address?: string | null
          parent_email: string
          parent_name: string
          parent_phone_number: string
          parent_whatsapp?: string | null
          source: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          child_id?: string | null
          class_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          lifecycle_stage?: string | null
          message?: string
          notes?: string | null
          number_of_children?: number | null
          offer_response?: string | null
          parent_address?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone_number?: string
          parent_whatsapp?: string | null
          source?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "creche_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          creche_id: string | null
          hearts: number | null
          id: string
          latitude: number
          longitude: number
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          creche_id?: string | null
          hearts?: number | null
          id?: string
          latitude: number
          longitude: number
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          creche_id?: string | null
          hearts?: number | null
          id?: string
          latitude?: number
          longitude?: number
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_staff: {
        Row: {
          date: string
          id: string
          remarks: string | null
          staff_id: string | null
          status: string
        }
        Insert: {
          date: string
          id?: string
          remarks?: string | null
          staff_id?: string | null
          status: string
        }
        Update: {
          date?: string
          id?: string
          remarks?: string | null
          staff_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_students: {
        Row: {
          attendance_date: string
          created_at: string | null
          id: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          id?: string
          status: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          id?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      child_invites: {
        Row: {
          child_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invitee_email: string | null
          invitee_user_id: string | null
          inviter_id: string
          relationship: string | null
          share_code: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitee_email?: string | null
          invitee_user_id?: string | null
          inviter_id: string
          relationship?: string | null
          share_code: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitee_email?: string | null
          invitee_user_id?: string | null
          inviter_id?: string
          relationship?: string | null
          share_code?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_invites_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_invites_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      child_parents: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          invitation_id: string | null
          invited_by: string | null
          is_verified: boolean | null
          permissions: Json | null
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          invited_by?: string | null
          is_verified?: boolean | null
          permissions?: Json | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          invited_by?: string | null
          is_verified?: boolean | null
          permissions?: Json | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_parents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_parents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_parents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          additional_notes: string | null
          allergies: string | null
          blood_type: string | null
          created_at: string | null
          creche_id: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical_conditions: string | null
          profile_picture_url: string | null
          share_code: string | null
          special_needs: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          creche_id?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          medical_conditions?: string | null
          profile_picture_url?: string | null
          share_code?: string | null
          special_needs?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          creche_id?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical_conditions?: string | null
          profile_picture_url?: string | null
          share_code?: string | null
          special_needs?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: true
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          created_at: string | null
          creche_id: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          status: string
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creche_id: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status: string
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creche_id?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_participants: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          newsletter_joined: boolean | null
          total_points: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          newsletter_joined?: boolean | null
          total_points?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          newsletter_joined?: boolean | null
          total_points?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      contest_referrals: {
        Row: {
          accepted: boolean | null
          created_at: string | null
          id: string
          points_earned: number | null
          referee_email: string
          referrer_id: string | null
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referee_email: string
          referrer_id?: string | null
        }
        Update: {
          accepted?: boolean | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referee_email?: string
          referrer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "contest_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_social_actions: {
        Row: {
          created_at: string | null
          followed: boolean | null
          id: string
          participant_id: string | null
          platform: string
          points: number | null
          shared: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          followed?: boolean | null
          id?: string
          participant_id?: string | null
          platform: string
          points?: number | null
          shared?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          followed?: boolean | null
          id?: string
          participant_id?: string | null
          platform?: string
          points?: number | null
          shared?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_social_actions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "contest_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          participant_1: string | null
          participant_2: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_1?: string | null
          participant_2?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_1?: string | null
          participant_2?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_classes: {
        Row: {
          capacity: number | null
          color: string
          created_at: string | null
          creche_id: string
          id: string
          max_age_months: number | null
          min_age_months: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          color?: string
          created_at?: string | null
          creche_id: string
          id?: string
          max_age_months?: number | null
          min_age_months?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          color?: string
          created_at?: string | null
          creche_id?: string
          id?: string
          max_age_months?: number | null
          min_age_months?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creche_classes_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          creche_id: string
          id: string
          image_url: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creche_id: string
          id?: string
          image_url: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creche_id?: string
          id?: string
          image_url?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creche_gallery_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_policies: {
        Row: {
          created_at: string | null
          creche_id: string
          file_url: string | null
          id: string
          last_updated: string
          notes: string | null
          policy_name: string
          policy_type: string
          review_due: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creche_id: string
          file_url?: string | null
          id?: string
          last_updated: string
          notes?: string | null
          policy_name: string
          policy_type: string
          review_due: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creche_id?: string
          file_url?: string | null
          id?: string
          last_updated?: string
          notes?: string | null
          policy_name?: string
          policy_type?: string
          review_due?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creche_policies_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_users: {
        Row: {
          creche_id: number
          role_id: number | null
          user_id: number
        }
        Insert: {
          creche_id: number
          role_id?: number | null
          user_id: number
        }
        Update: {
          creche_id?: number
          role_id?: number | null
          user_id?: number
        }
        Relationships: []
      }
      creches: {
        Row: {
          account_holder: string | null
          account_number: string | null
          account_type: string | null
          address: string | null
          bank_name: string | null
          branch_code: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          facilities: Json | null
          features: Json | null
          header_image: string | null
          id: string
          instagram_url: string | null
          latitude: number | null
          linkedin_url: string | null
          logo: string | null
          longitude: number | null
          monthly_price: number | null
          name: string
          operating_hours: string | null
          payment_day: number | null
          phone_number: string | null
          plan: string | null
          price: number | null
          province: string | null
          registered: boolean | null
          services: Json | null
          suburb: string | null
          telegram_number: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
          weekly_price: number | null
          whatsapp_number: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          bank_name?: string | null
          branch_code?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          facilities?: Json | null
          features?: Json | null
          header_image?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo?: string | null
          longitude?: number | null
          monthly_price?: number | null
          name: string
          operating_hours?: string | null
          payment_day?: number | null
          phone_number?: string | null
          plan?: string | null
          price?: number | null
          province?: string | null
          registered?: boolean | null
          services?: Json | null
          suburb?: string | null
          telegram_number?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          weekly_price?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          bank_name?: string | null
          branch_code?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          facilities?: Json | null
          features?: Json | null
          header_image?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo?: string | null
          longitude?: number | null
          monthly_price?: number | null
          name?: string
          operating_hours?: string | null
          payment_day?: number | null
          phone_number?: string | null
          plan?: string | null
          price?: number | null
          province?: string | null
          registered?: boolean | null
          services?: Json | null
          suburb?: string | null
          telegram_number?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          weekly_price?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          color_code: string | null
          created_at: string | null
          creche_id: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_link: string | null
          priority: string | null
          start: string
          title: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          color_code?: string | null
          created_at?: string | null
          creche_id?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          priority?: string | null
          start: string
          title: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          color_code?: string | null
          created_at?: string | null
          creche_id?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          priority?: string | null
          start?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      help_content: {
        Row: {
          category: Database["public"]["Enums"]["help_category"]
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["help_category"]
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["help_category"]
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      http_log: {
        Row: {
          duration: number | null
          error: string | null
          id: string
          ip_address: string | null
          method: string | null
          path: string | null
          request_id: string | null
          request_time: string | null
          status: number | null
          user_agent: string | null
        }
        Insert: {
          duration?: number | null
          error?: string | null
          id?: string
          ip_address?: string | null
          method?: string | null
          path?: string | null
          request_id?: string | null
          request_time?: string | null
          status?: number | null
          user_agent?: string | null
        }
        Update: {
          duration?: number | null
          error?: string | null
          id?: string
          ip_address?: string | null
          method?: string | null
          path?: string | null
          request_id?: string | null
          request_time?: string | null
          status?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          action_taken: string
          created_at: string | null
          creche_id: string
          description: string
          id: string
          incident_date: string
          incident_time: string
          incident_type: string
          location: string
          reported_by: string | null
          severity: string
          student_id: string | null
          updated_at: string | null
          witness: string | null
        }
        Insert: {
          action_taken: string
          created_at?: string | null
          creche_id: string
          description: string
          id?: string
          incident_date: string
          incident_time: string
          incident_type: string
          location: string
          reported_by?: string | null
          severity: string
          student_id?: string | null
          updated_at?: string | null
          witness?: string | null
        }
        Update: {
          action_taken?: string
          created_at?: string | null
          creche_id?: string
          description?: string
          id?: string
          incident_date?: string
          incident_time?: string
          incident_type?: string
          location?: string
          reported_by?: string | null
          severity?: string
          student_id?: string | null
          updated_at?: string | null
          witness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          creche_id: string
          current_quantity: number
          id: string
          last_restocked: string | null
          minimum_threshold: number
          name: string
          notes: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          creche_id: string
          current_quantity: number
          id?: string
          last_restocked?: string | null
          minimum_threshold: number
          name: string
          notes?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          creche_id?: string
          current_quantity?: number
          id?: string
          last_restocked?: string | null
          minimum_threshold?: number
          name?: string
          notes?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          discount: number | null
          id: string
          invoice_id: string | null
          quantity: number
          title: string
          total_price: number
          unit_price: number
        }
        Insert: {
          discount?: number | null
          id?: string
          invoice_id?: string | null
          quantity: number
          title: string
          total_price: number
          unit_price: number
        }
        Update: {
          discount?: number | null
          id?: string
          invoice_id?: string | null
          quantity?: number
          title?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          application_id: string | null
          child_id: string | null
          created_at: string | null
          creche_id: string | null
          id: string
          prepared_by: string | null
          prepared_for: string | null
          status: string | null
          student_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          child_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          prepared_by?: string | null
          prepared_for?: string | null
          status?: string | null
          student_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          child_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          prepared_by?: string | null
          prepared_for?: string | null
          status?: string | null
          student_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_types: {
        Row: {
          color: string
          created_at: string | null
          creche_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          creche_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          creche_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_types_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          active: boolean | null
          class_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          lesson_type: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          class_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          lesson_type: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          class_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          lesson_type?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "creche_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_lesson_type_fkey"
            columns: ["lesson_type"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string | null
          id: string
          message: string
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          id: string
          message: string
          read_at: string | null
          sender_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          message: string
          read_at?: string | null
          sender_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_meal_plans: {
        Row: {
          created_at: string | null
          creche_id: string
          friday_menu: string | null
          id: string
          meal_type: string
          monday_menu: string | null
          thursday_menu: string | null
          tuesday_menu: string | null
          updated_at: string | null
          wednesday_menu: string | null
          week_starting: string
        }
        Insert: {
          created_at?: string | null
          creche_id: string
          friday_menu?: string | null
          id?: string
          meal_type: string
          monday_menu?: string | null
          thursday_menu?: string | null
          tuesday_menu?: string | null
          updated_at?: string | null
          wednesday_menu?: string | null
          week_starting: string
        }
        Update: {
          created_at?: string | null
          creche_id?: string
          friday_menu?: string | null
          id?: string
          meal_type?: string
          monday_menu?: string | null
          thursday_menu?: string | null
          tuesday_menu?: string | null
          updated_at?: string | null
          wednesday_menu?: string | null
          week_starting?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meal_plans_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      photobook_entries: {
        Row: {
          caption: string | null
          created_at: string | null
          creche_id: string
          id: string
          image_url: string
          month: number
          updated_at: string | null
          year: number
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creche_id: string
          id?: string
          image_url: string
          month: number
          updated_at?: string | null
          year: number
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creche_id?: string
          id?: string
          image_url?: string
          month?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "photobook_entries_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role_name: string
        }
        Insert: {
          id?: string
          role_name: string
        }
        Update: {
          id?: string
          role_name?: string
        }
        Relationships: []
      }
      safeguarding_concerns: {
        Row: {
          action_taken: string
          concern_date: string
          concern_type: string
          created_at: string | null
          creche_id: string
          description: string
          id: string
          reported_by: string | null
          status: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_taken: string
          concern_date: string
          concern_type: string
          created_at?: string | null
          creche_id: string
          description: string
          id?: string
          reported_by?: string | null
          status: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string
          concern_date?: string
          concern_type?: string
          created_at?: string | null
          creche_id?: string
          description?: string
          id?: string
          reported_by?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safeguarding_concerns_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safeguarding_concerns_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string | null
          creche_id: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          position: string
          qualification: string | null
          staff_number: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          creche_id?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          position: string
          qualification?: string | null
          staff_number?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          creche_id?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          position?: string
          qualification?: string | null
          staff_number?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training: {
        Row: {
          certification_url: string | null
          completion_date: string | null
          created_at: string | null
          creche_id: string
          expiry_date: string | null
          id: string
          notes: string | null
          staff_id: string | null
          status: string
          training_name: string
          training_type: string
          updated_at: string | null
        }
        Insert: {
          certification_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          creche_id: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          status: string
          training_name: string
          training_type: string
          updated_at?: string | null
        }
        Update: {
          certification_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          creche_id?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          status?: string
          training_name?: string
          training_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          student_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_medical_records: {
        Row: {
          allergies: string | null
          created_at: string | null
          creche_id: string
          id: string
          immunization_status: string
          last_checkup: string | null
          medical_notes: string | null
          next_checkup: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          creche_id: string
          id?: string
          immunization_status: string
          last_checkup?: string | null
          medical_notes?: string | null
          next_checkup?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          creche_id?: string
          id?: string
          immunization_status?: string
          last_checkup?: string | null
          medical_notes?: string | null
          next_checkup?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_medical_records_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medical_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          age: number | null
          application_id: string | null
          child_id: string | null
          class: string | null
          class_id: string | null
          created_at: string | null
          creche_id: string | null
          disabilities_allergies: string | null
          dob: string | null
          fees_owed: number | null
          fees_paid: number | null
          id: string
          name: string
          parent_email: string | null
          parent_name: string | null
          parent_phone_number: string | null
          parent_whatsapp: string | null
          profile_picture: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          application_id?: string | null
          child_id?: string | null
          class?: string | null
          class_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          disabilities_allergies?: string | null
          dob?: string | null
          fees_owed?: number | null
          fees_paid?: number | null
          id?: string
          name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone_number?: string | null
          parent_whatsapp?: string | null
          profile_picture?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          application_id?: string | null
          child_id?: string | null
          class?: string | null
          class_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          disabilities_allergies?: string | null
          dob?: string | null
          fees_owed?: number | null
          fees_paid?: number | null
          id?: string
          name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone_number?: string | null
          parent_whatsapp?: string | null
          profile_picture?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "creche_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          category: string
          converted_at: string | null
          converted_ticket_id: string | null
          created_at: string | null
          creche_id: string | null
          id: string
          message: string
          priority: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["support_request_status"] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          converted_at?: string | null
          converted_ticket_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          message: string
          priority?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_request_status"] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          converted_at?: string | null
          converted_ticket_id?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          message?: string
          priority?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_request_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_requests_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_converted_ticket_id_fkey"
            columns: ["converted_ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          creche_id: string | null
          description: string
          id: string
          organization_id: string | null
          priority: string
          resolved_at: string | null
          source: string | null
          status_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          creche_id?: string | null
          description: string
          id?: string
          organization_id?: string | null
          priority?: string
          resolved_at?: string | null
          source?: string | null
          status_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          creche_id?: string | null
          description?: string
          id?: string
          organization_id?: string | null
          priority?: string
          resolved_at?: string | null
          source?: string | null
          status_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "ticket_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: number
          ticket_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: number
          ticket_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: number
          ticket_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_notes: {
        Row: {
          created_at: string | null
          id: string
          note: string
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note: string
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_status: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          order_index: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          order_index?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      ticket_time_logs: {
        Row: {
          description: string
          id: string
          logged_at: string | null
          ticket_id: string | null
          time_spent: number
          user_id: string | null
        }
        Insert: {
          description: string
          id?: string
          logged_at?: string | null
          ticket_id?: string | null
          time_spent: number
          user_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          logged_at?: string | null
          ticket_id?: string | null
          time_spent?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_time_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_creche: {
        Row: {
          creche_id: string
          user_id: string
        }
        Insert: {
          creche_id: string
          user_id: string
        }
        Update: {
          creche_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_creche_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_creche_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          creche_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creche_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          creche_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          article_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          id_number: string | null
          last_name: string | null
          latitude: string | null
          longitude: string | null
          payment_score: number | null
          phone_number: string | null
          price: string | null
          profile_picture_url: string | null
          province: string | null
          role_id: string | null
          suburb: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          latitude?: string | null
          longitude?: string | null
          payment_score?: number | null
          phone_number?: string | null
          price?: string | null
          profile_picture_url?: string | null
          province?: string | null
          role_id?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          latitude?: string | null
          longitude?: string | null
          payment_score?: number | null
          phone_number?: string | null
          price?: string | null
          profile_picture_url?: string | null
          province?: string | null
          role_id?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configurations: {
        Row: {
          created_at: string | null
          creche_id: string | null
          enabled: boolean | null
          fields_mapping: Json | null
          id: string
          last_used_at: string | null
          name: string
          source: string | null
          status: string | null
          target_table: string | null
          updated_at: string | null
          webhook_key: string
        }
        Insert: {
          created_at?: string | null
          creche_id?: string | null
          enabled?: boolean | null
          fields_mapping?: Json | null
          id?: string
          last_used_at?: string | null
          name: string
          source?: string | null
          status?: string | null
          target_table?: string | null
          updated_at?: string | null
          webhook_key?: string
        }
        Update: {
          created_at?: string | null
          creche_id?: string | null
          enabled?: boolean | null
          fields_mapping?: Json | null
          id?: string
          last_used_at?: string | null
          name?: string
          source?: string | null
          status?: string | null
          target_table?: string | null
          updated_at?: string | null
          webhook_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configurations_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          payload: Json | null
          status: string | null
          user_agent: string | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          status?: string | null
          user_agent?: string | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          status?: string | null
          user_agent?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      article_with_details: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_picture: string | null
          comment_count: number | null
          content: string | null
          created_at: string | null
          creche_id: string | null
          creche_logo: string | null
          creche_name: string | null
          hearts: number | null
          id: string | null
          latitude: number | null
          longitude: number | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_child_invitation: {
        Args: { p_invitation_id: string; p_user_id: string }
        Returns: Json
      }
      check_child_permission: {
        Args: { p_action: string; p_child_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rls_access: {
        Args: { table_name: string; user_id: string }
        Returns: Json
      }
      create_child_invitation: {
        Args: {
          p_child_id: string
          p_invitee_email: string
          p_inviter_id: string
          p_relationship?: string
        }
        Returns: Json
      }
      generate_monthly_invoices: { Args: never; Returns: undefined }
      generate_share_code: { Args: never; Returns: string }
      get_child_parents: {
        Args: { p_child_id: string }
        Returns: {
          email: string
          first_name: string
          invited_by: string
          is_primary: boolean
          is_verified: boolean
          joined_at: string
          last_name: string
          permissions: Json
          phone_number: string
          relationship: string
          user_id: string
        }[]
      }
      get_class_enrollment_count: {
        Args: { p_class_id: string }
        Returns: number
      }
      get_class_waiting_count: { Args: { p_class_id: string }; Returns: number }
      get_user_children: {
        Args: { p_user_id: string }
        Returns: {
          can_edit: boolean
          can_manage: boolean
          child_id: string
          creche_id: string
          date_of_birth: string
          first_name: string
          gender: string
          is_primary: boolean
          last_name: string
          permissions: Json
          profile_picture_url: string
          relationship: string
        }[]
      }
      is_notification_enabled: {
        Args: { _type: string; _user_id: string }
        Returns: boolean
      }
      notify_creche_users: {
        Args: {
          _creche_id: string
          _message: string
          _sender: string
          _title: string
          _type: string
        }
        Returns: undefined
      }
      update_contest_participant_total_points: {
        Args: { participant_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      help_category: "documentation" | "faq" | "tutorial"
      support_request_status:
        | "open"
        | "in_progress"
        | "on_hold"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      help_category: ["documentation", "faq", "tutorial"],
      support_request_status: [
        "open",
        "in_progress",
        "on_hold",
        "resolved",
        "closed",
      ],
    },
  },
} as const
