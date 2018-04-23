package de.eddies.attachments;

public enum EAttachmentDomain
{
    /**
     * Attachments fuer Member, die id ist die MemberId
     */
    MEMBER,
    
    /**
     * Anhänge für die Partner
     */
    PARTNER,
    
    
    /**
     * Wird für internes Attachment für das Thumbnail verwendet
     */
    THUMBNAIL,
    
    /**
     * Wird für internes Attachment für die Mailsignatur verwendet
     */
    MAILSIG,
    
    /**
     * Attachments an AccountingRecords, die id ist die accRecordId
     */
    ACCRECORD,
    
    /**
     * Attachments an Kursen, die id ist die CourseId
     */
    COURSE,
    
    /**
     * Anhang an Kurs-Lokationen
     */
    COURSELOC,
    
    /**
     * Attachments, welche im FIleSystemBrowser angezeigt werden
     */
    FILESYS, 

    /**
     * Attachments für die TODO-List
     */
    TODOLIST
}
