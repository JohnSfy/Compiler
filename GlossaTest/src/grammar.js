"use strict";

function getGrammar() {
  return `Glwssa {

      Application  = 
        nl*
        CommentInlineInput*
        MainProgram
        (UserFunction | UserProcedure)*
    
      MainProgram      = 
        "Αλγόριθμος" id nl+
        Declaration_Block 
        Block
        "Τέλος" id? nl*

      UserFunction  = 
        "ΣΥΝΑΡΤΗΣΗ"  id "(" AtLeastOneParameters ")" ":" ("ΑΚΕΡΑΙΑ" | "ΠΡΑΓΜΑΤΙΚΗ" | "ΧΑΡΑΚΤΗΡΑΣ" | "ΛΟΓΙΚΗ") nl+
        Declaration_Block
        "ΑΡΧΗ" nl+
        Block
        "ΤΕΛΟΣ_ΣΥΝΑΡΤΗΣΗΣ" nl*
        
      UserProcedure = 
        "ΔΙΑΔΙΚΑΣΙΑ" id ("(" Parameters ")")? nl+
        Declaration_Block
        "ΑΡΧΗ" nl+
        Block
        "ΤΕΛΟΣ_ΔΙΑΔΙΚΑΣΙΑΣ" nl*

      Declaration_Block = 
        ("ΣΤΑΘΕΡΕΣ" nl+ 
        DefConstant*)?
        ("ΜΕΤΑΒΛΗΤΕΣ" nl+ 
        DefVariables*)?

      DefConstant  = id "=" Expr nl+

      DefVariables = ("ΑΚΕΡΑΙΕΣ" | "ΠΡΑΓΜΑΤΙΚΕΣ" | "ΧΑΡΑΚΤΗΡΕΣ" | "ΛΟΓΙΚΕΣ") ":" VarParameters nl+
      
      Block = (InnerCommand nl+)*

      InnerCommand         = AssignExpr | WhileExpr | DoWhileExpr | ForExpr | IfExpr | Stmt_Case | inlinecomment | ProcedureCall | Stmt_Write | Stmt_Read

      AssignExpr   = (IdTbl | id) "<-" Expr

      Stmt_Write    = grapse Arguments 
      Stmt_Read     = diavase VarParameters

      WhileExpr     = "Όσο" Expr "επανάλαβε" nl+ Block "Τέλος_επανάληψης"
      DoWhileExpr   = "Αρχή_επανάληψης" nl+ Block "μέχρις_ότου" Expr
      ForExpr       = "Για" (IdTbl | id) "από" Expr "μέχρι" Expr (("με_βήμα" | "ΜΕ ΒΗΜΑ") Expr)? nl+ Block "Τέλος_επανάληψης"
      IfExpr        = "Αν" Expr "τότε" nl+ Block ("αλλιώς_αν" Expr "τότε" nl+ Block)* ("αλλιώς" nl+ Block)? "Τέλος_αν"

      Subrange      = Expr ".." Expr
      SelectExpr    = "<" Expr | "<=" Expr | ">" Expr | ">=" Expr | "=" Expr | "<>" Expr
      SelectCase    = Subrange | SelectExpr | Expr 
      AtLeastOneSelectCase = NonemptyListOf<SelectCase, ",">
      Stmt_Case   = "ΕΠΙΛΕΞΕ" Expr nl+ ("ΠΕΡΙΠΤΩΣΗ" ~"αλλιώς" AtLeastOneSelectCase nl+ Block)* ("ΠΕΡΙΠΤΩΣΗ" "αλλιώς" nl+ Block)? "ΤΕΛΟΣ_ΕΠΙΛΟΓΩΝ"

      FunctionCall          = id "(" Arguments ")"
      ProcedureCall         = "ΚΑΛΕΣΕ" id ("(" Arguments ")")? 

      AtLeastOneArguments   = NonemptyListOf<Expr, ",">
      Arguments             = ListOf<Expr, ","> 

      AtLeastOneParameters   = NonemptyListOf<id, ",">
      Parameters             = ListOf<id, ",">

      VarParameters          = NonemptyListOf<(IdTbl | id), ",">

      AtLeastOneLit          = NonemptyListOf<Expr, ",">
      CommentInlineInput     = keyboardinput AtLeastOneLit nl+

      reservedWord = grapse | diavase | and | or | not | div | mod | boollit

      grapse       = "Εμφάνισε" ~idrest
      diavase      = "Διάβασε" ~idrest

      true        =  ("ΑΛΗΘΗΣ" | "ΑΛΗΘΉΣ" | "αληθης" | "αληθής") ~idrest
      false       =  ("ΨΕΥΔΗΣ" | "ΨΕΥΔΉΣ" | "ψευδης" | "ψευδής") ~idrest

      or          =  ("Η" | "Ή" | "ή" | "η") ~idrest
      and         =  ("ΚΑΙ" | "και") ~idrest
      not         =  ("ΟΧΙ" | "ΌΧΙ" | "οχι" | "όχι") ~idrest

      div         =  ("DIV" | "div") ~idrest
      mod         =  ("MOD" | "mod") ~idrest

      /*    function     = "ΣΥΝΑΡΤΗΣΗ" ~idchar
          if           = "Αν" ~idchar
          else         = "αλλιώς" ~idchar
          while        = "Όσο" ~idchar
      */


     Expr = Exp 

     Exp
       = ExpOr
       
     ExpOr
       =  ExpOr or ExpAnd               -- orop
       |  ExpAnd
               
     ExpAnd
       =  ExpAnd and ExpRel             -- andop
       |  ExpRel          

     ExpRel
       =  ExpRel "<"  AddExp             -- lt
       |  ExpRel ">"  AddExp             -- gt
       |  ExpRel "<=" AddExp             -- lte
       |  ExpRel ">=" AddExp             -- gte
       |  ExpRel "="  AddExp             -- eq
       |  ExpRel "<>" AddExp             -- neq
       |  AddExp    
       
     AddExp
       =  AddExp "+" MulExp              -- add
       |  AddExp "-" MulExp              -- sub
       |  MulExp

     MulExp
       =  MulExp "*" ExpExp             -- mul
       |  MulExp "/" ExpExp             -- div
       |  MulExp div ExpExp             -- intdiv
       |  MulExp mod ExpExp             -- intmod
       |  ExpExp

     ExpExp
       = ExpExp "^" PriExp              -- powop
       | PriExp

     PriExp
       = "(" Exp ")"                    -- parens
       | "+" ExpExp                     -- pos
       | "-" ExpExp                     -- neg
       |  not ExpOr                     -- not
       |  boollit
       |  floatlit
       |  intlit
       |  strlit
       |  FunctionCall
       |  IdTbl
       |  id

      IdTbl         = id "[" AtLeastOneArguments "]"

      id            = ~reservedWord  letter (letter|digit|"_")* 

      idrest        = letter | digit | "_"

      powop         =  "^"
      mulop         =  "*" | "/" | div | mod
      addop         =  "+" | "-"
      relop         =  "<" | "<=" | ">" | ">=" | "=" | "<>"
      prefixop      =  neq | not
      neq           =  "-"

      lit           = floatlit | intlit | strlit | boollit
      floatlit      = digit* "." digit+ 
      intlit        = digit+
      qq            = "'" | "\\""
      strlit        = qq (~qq any)* qq
      boollit       = true | false

      keyboardinput =  "!" whitespace* "KEYBOARD_INPUT:"
      inlinecomment       = ~keyboardinput "!" (~nl any)*

      nl            = "\\n" | "\\r"        

      whitespace    = "\t" | " "
      breakLine     = ("\\n" | "\\r")+ whitespace* "&"

      space        := breakLine | whitespace | inlinecomment  


  }`;
}

module.exports = {
  getGrammar,
};
